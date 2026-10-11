import json
from collections import Counter
from datetime import datetime, timedelta, timezone

from db.database import get_conn

PHISHING_GROUP = {"Phishing", "Credential Harvesting", "Spam / Scam"}
COLORS = {"Phishing": "#ef4444", "BEC / Impersonation": "#f59e0b", "Credential Harvesting": "#8b5cf6",
          "Malware Attachment": "#ec4899", "Spam / Scam": "#06b6d4"}


def save_investigation(result, user_id):
    # The INV id comes from the database row number, so it is unique and sequential.
    conn = get_conn()
    cur = conn.execute("INSERT INTO investigations (user_id, created_at, data) VALUES (?, ?, ?)",
                       (user_id, result["createdAt"], "{}"))
    row_id = cur.lastrowid
    result["id"] = f"INV-{datetime.now(timezone.utc).year}-{row_id:04d}"
    conn.execute("UPDATE investigations SET inv_id=?, data=? WHERE id=?",
                 (result["id"], json.dumps(result), row_id))
    conn.commit()
    conn.close()
    return result


def list_investigations(user_id, limit=200):
    # Every query filters by user_id, so one user can never read another user's reports.
    conn = get_conn()
    rows = conn.execute("SELECT data FROM investigations WHERE user_id=? ORDER BY id DESC LIMIT ?",
                        (user_id, limit)).fetchall()
    conn.close()
    return [json.loads(r[0]) for r in rows]


def get_investigation(inv_id, user_id):
    conn = get_conn()
    row = conn.execute("SELECT data FROM investigations WHERE inv_id=? AND user_id=?",
                       (inv_id, user_id)).fetchone()
    conn.close()
    return json.loads(row[0]) if row else None


def build_stats(invs):
    # Real numbers for the dashboard cards and charts, computed from the saved investigations.
    cats = Counter(i.get("category", "Clean") for i in invs)
    levels = Counter(i["riskLevel"] for i in invs)
    threats = [i for i in invs if i.get("category", "Clean") != "Clean"]

    today = datetime.now(timezone.utc).date()
    trend = []
    for n in range(6, -1, -1):                      # last 7 days, oldest first
        d = today - timedelta(days=n)
        c = Counter(i["category"] for i in threats if i["createdAt"][:10] == d.isoformat())
        phishing = sum(c[k] for k in PHISHING_GROUP)
        trend.append({"day": d.strftime("%a"), "date": d.isoformat(), "phishing": phishing,
                      "bec": c["BEC / Impersonation"], "malware": c["Malware Attachment"],
                      "total": phishing + c["BEC / Impersonation"] + c["Malware Attachment"]})

    def indicators(kind):
        return {x["indicator"] for i in invs for x in i.get("iocs", [])
                if x["type"] == kind and x["risk"] in ("HIGH", "CRITICAL")}

    return {
        "metrics": {
            "totalAnalyzed": len(invs),
            "highRiskCount": levels["HIGH"] + levels["CRITICAL"],
            "mediumRiskCount": levels["MEDIUM"],
            "lowRiskCount": levels["LOW"],
            "maliciousIps": len(indicators("IP")),
            "suspiciousDomains": len(indicators("Domain")),
            "phishingDetected": sum(cats[k] for k in PHISHING_GROUP),
        },
        "trend": trend,
        "categories": [{"name": k, "value": cats[k], "color": COLORS[k]} for k in COLORS if cats[k]],
        "risk": [
            {"level": "Critical (81-100)", "count": levels["CRITICAL"], "fill": "#ef4444"},
            {"level": "High (61-80)", "count": levels["HIGH"], "fill": "#f97316"},
            {"level": "Medium (31-60)", "count": levels["MEDIUM"], "fill": "#eab308"},
            {"level": "Low (0-30)", "count": levels["LOW"], "fill": "#10b981"},
        ],
    }