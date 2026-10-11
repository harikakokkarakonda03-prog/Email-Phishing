import os
import io
import csv
import json
import html
import tempfile
import re
from pathlib import Path

from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from engine.analyze import analyze_email as analyze_full
from db.investigations import save_investigation, list_investigations, get_investigation, build_stats
from fastapi import FastAPI, Request, Depends, Header, HTTPException
from fastapi.responses import Response, HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from auth.security import decode_token, hash_password, verify_password, create_token
from analysis.scoring import analyze_email
from db.database import save_scan, get_conn
from reporting.pdf_export import build_pdf

app = FastAPI(title="Email Forensics")
# Lets the React frontend (running on port 5173) call this backend.
# When the frontend is deployed online, its address must be added here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folder that holds the HTML pages and style.css (email-forensics/dashboard)
PAGES = Path(__file__).resolve().parent.parent / "dashboard"
# Makes dashboard/style.css available at /static/style.css
app.mount("/static", StaticFiles(directory=PAGES), name="static")


def current_user(authorization: str = Header(None), token: str = None):
    # Token comes from the Authorization header (API calls) or ?token= (links opened in the browser)
    raw = token
    if authorization and authorization.startswith("Bearer "):
        raw = authorization[7:]
    user_id = decode_token(raw) if raw else None
    if not user_id:
        raise HTTPException(401, "Please log in")
    return user_id
# ---------- Pages ----------

@app.get("/login-page", response_class=HTMLResponse)
def login_page():
    return (PAGES / "login.html").read_text(encoding="utf-8")


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard():
    return (PAGES / "dashboard.html").read_text(encoding="utf-8")


# ---------- Login and register ----------
# Email must look like name@domain.com (a plain word like "harika" is rejected)
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$")

COMMON_PASSWORDS = {"password", "password1", "password123", "qwerty123", "12345678", "admin123"}


def check_email(email):
    if len(email) > 254 or not EMAIL_RE.match(email):
        return "Enter a valid email address, like name@example.com"
    return None


def check_password(password, email):
    # Returns an error message, or None if the password is strong enough
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if len(password) > 128:
        return "Password is too long"
    if not re.search(r"[A-Z]", password):
        return "Password needs at least one capital letter"
    if not re.search(r"[a-z]", password):
        return "Password needs at least one small letter"
    if not re.search(r"\d", password):
        return "Password needs at least one number"
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Password needs at least one symbol, like ! @ # $ %"
    if password.lower() in COMMON_PASSWORDS:
        return "This password is too common"
    if email.split("@")[0].lower() in password.lower():
        return "Password must not contain your email name"
    return None
class Credentials(BaseModel):
    email: str
    password: str


@app.post("/register")
def register(c: Credentials):
    email = c.email.strip().lower()
    error = check_email(email) or check_password(c.password, email)
    if error:
        raise HTTPException(400, error)
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, hash_password(c.password)),
        )
        conn.commit()
    except Exception:
        raise HTTPException(400, "Email already registered")
    finally:
        conn.close()
    return {"token": create_token(cur.lastrowid)}

@app.post("/login")
def login(c: Credentials):
    conn = get_conn()
    row = conn.execute(
               "SELECT id, password_hash FROM users WHERE email=?", (c.email.strip().lower(),)
    ).fetchone()
    conn.close()
    if not row or not verify_password(c.password, row[1]):
        raise HTTPException(401, "Wrong email or password")
    return {"token": create_token(row[0])}


# ---------- Scanning and data ----------

@app.post("/scan")
async def scan(request: Request, user_id: int = Depends(current_user)):
    raw = await request.body()
    if not raw.strip():
        raise HTTPException(400, "The email is empty")
    if len(raw) > MAX_EMAIL_BYTES:
        raise HTTPException(413, "The email is too large (maximum 10 MB)")
    # Same engine and storage as the website, so the extension's scans appear in the Reports page.
    # run_in_threadpool keeps the server responsive while the analysis waits for network lookups.
    result = await run_in_threadpool(lambda: save_investigation(analyze_full(raw, "Gmail (extension)"), user_id))
    top = sorted(result["explainableReasons"], key=lambda r: -r["weight"])[:2]
    return {
        "id": result["id"],
        "threatScore": result["threatScore"],
        "riskLevel": result["riskLevel"],
        "classification": result["classification"],
        "top": [r["title"] for r in top],   # the two strongest reasons, shown in the alert
    }


@app.get("/scans")
def list_scans(user_id: int = Depends(current_user)):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, created_at, subject, sender, danger_percent, verdict FROM scans WHERE user_id=? ORDER BY id DESC",
        (user_id,),  # only this user's scans
    ).fetchall()
    conn.close()
    keys = ["id", "created_at", "subject", "sender", "danger_percent", "verdict"]
    return [dict(zip(keys, r)) for r in rows]


@app.get("/stats")
def stats(user_id: int = Depends(current_user)):
    conn = get_conn()
    by_verdict = conn.execute(
        "SELECT verdict, COUNT(*) FROM scans WHERE user_id=? GROUP BY verdict", (user_id,)
    ).fetchall()
    by_day = conn.execute(
        "SELECT substr(created_at, 1, 10) AS day, COUNT(*) FROM scans "
        "WHERE user_id=? AND verdict != 'Safe' GROUP BY day ORDER BY day", (user_id,)
    ).fetchall()
    conn.close()
    return {
        "by_verdict": {v: c for v, c in by_verdict},
        "threats_by_day": {d: c for d, c in by_day},
    }


@app.get("/export/csv")
def export_csv(user_id: int = Depends(current_user)):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, created_at, subject, sender, sender_ip, danger_percent, verdict FROM scans WHERE user_id=? ORDER BY id DESC",
        (user_id,),
    ).fetchall()
    conn.close()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "created_at", "subject", "sender", "sender_ip", "danger_percent", "verdict"])
    w.writerows(rows)
    return Response(buf.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=scan_history.csv"})


# ---------- Reports ----------

# --- REPLACE FROM HERE ---

def owns_scan(scan_id: str, user_id: int):
    # Fixed to query the correct table and column name
    conn = get_conn()
    row = conn.execute(
        "SELECT 1 FROM investigations WHERE inv_id=? AND user_id=?", (str(scan_id), user_id)
    ).fetchone()
    conn.close()
    return row is not None


@app.get("/reports/{scan_id}/download")
def download(scan_id: str, user_id: int = Depends(current_user)):
    if not owns_scan(scan_id, user_id):
        return JSONResponse({"error": "Scan not found"}, status_code=404)
    path = os.path.join(tempfile.gettempdir(), f"report_{scan_id}.pdf")
    build_pdf(scan_id, path)
    return FileResponse(path, media_type="application/pdf",
                        filename=f"forensic_report_{scan_id}.pdf")
# --- UP TO HERE ---

# ---------- API for the ThreatMailer frontend ----------

class AnalyzeRequest(BaseModel):
    raw: str                      # the full email text (headers + body)
    fileName: str | None = None

MAX_EMAIL_BYTES = 10 * 1024 * 1024


@app.post("/api/analyze")
def api_analyze(body: AnalyzeRequest, user_id: int = Depends(current_user)):
    raw = body.raw.encode("utf-8")
    if not raw.strip():
        raise HTTPException(400, "The email is empty")
    if len(raw) > MAX_EMAIL_BYTES:
        raise HTTPException(413, "The email is too large (maximum 10 MB)")
    # Analyse, then save under this user's account
    return save_investigation(analyze_full(raw, body.fileName), user_id)


@app.get("/api/investigations")
def api_list(user_id: int = Depends(current_user)):
    return list_investigations(user_id)


@app.get("/api/investigations/{inv_id}")
def api_get(inv_id: str, user_id: int = Depends(current_user)):
    inv = get_investigation(inv_id, user_id)
    if not inv:
        raise HTTPException(404, "Investigation not found")
    return inv


@app.get("/api/stats")
def api_stats(user_id: int = Depends(current_user)):
    return build_stats(list_investigations(user_id, 1000))