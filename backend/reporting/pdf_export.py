import json
from fpdf import FPDF
from db.database import get_conn


def clean(text):
    # The PDF font only knows basic Latin letters, so dashes and bullets are replaced by a plain "-"
    text = str(text).replace("\u2013", "-").replace("\u2014", "-").replace("\u2022", "-")
    return text.encode("latin-1", "replace").decode("latin-1")


def line(pdf, text, size=11, bold=False):
    pdf.set_font("Helvetica", "B" if bold else "", size)
    pdf.multi_cell(0, 7, clean(text), new_x="LMARGIN", new_y="NEXT")


def build_pdf(scan_id, out_path):
    conn = get_conn()
    row = conn.execute("SELECT data FROM investigations WHERE inv_id=?", (str(scan_id),)).fetchone()
    conn.close()
    if not row:
        return None

    r = json.loads(row[0])  # the full saved investigation
    headers = r.get("emailHeaders", {})
    path = r.get("transmissionPath", [])
    origin = next((h for h in path if h.get("isSenderOrigin")), path[0] if path else None)

    pdf = FPDF()
    pdf.add_page()
    line(pdf, "Email Forensic Report", 18, True)
    line(pdf, f'Scan ID: {scan_id}    Date (UTC): {str(r.get("createdAt", ""))[:19].replace("T", " ")}')
    pdf.ln(3)

    line(pdf, f'THREAT SCORE: {r.get("threatScore", 0)}/100  ({r.get("riskLevel", "UNKNOWN")})', 16, True)
    line(pdf, f'Classification: {r.get("classification", "")}')
    line(pdf, str(r.get("summary", "")))
    pdf.ln(3)

    line(pdf, "Email details", 13, True)
    line(pdf, f'Subject: {r.get("subject", "")}')
    line(pdf, f'Sender: {r.get("sender", "")}')
    line(pdf, f'Reply-To: {headers.get("replyTo", "None")}')
    line(pdf, f'Sender IP: {headers.get("xOriginatingIp", "Unknown")}')
    pdf.ln(3)

    line(pdf, "Approximate sender location", 13, True)
    if origin and origin.get("country") not in (None, "Unknown"):
        line(pdf, f'{origin.get("city", "Unknown")}, {origin.get("country")}')
        line(pdf, f'ISP: {origin.get("isp", "Unknown")}    ASN: {origin.get("asn", "Unknown")}')
        if origin.get("isSuspicious"):
            line(pdf, "Flagged: this address belongs to an anonymizing proxy, VPN or Tor network.")
    else:
        # We say so honestly instead of guessing
        line(pdf, "Not available: no public sender IP could be located in this email.")
    pdf.ln(3)

    auth = r.get("authentication", {})
    line(pdf, "Email authentication", 13, True)
    line(pdf, "SPF: {}    DKIM: {}    DMARC: {}".format(
        auth.get("spf", {}).get("status", "NONE"),
        auth.get("dkim", {}).get("status", "NONE"),
        auth.get("dmarc", {}).get("status", "NONE")))
    pdf.ln(3)

    line(pdf, "Risk factors and evidence", 13, True)
    reasons = r.get("explainableReasons", [])
    if reasons:
        for x in reasons:
            line(pdf, f'- [{x.get("severity", "INFO")}] {x.get("title", "")}: {x.get("evidence", "")}')
    else:
        line(pdf, "No suspicious indicators were found.")
    pdf.ln(3)

    iocs = r.get("iocs", [])
    if iocs:
        line(pdf, "Indicators of compromise", 13, True)
        for i in iocs[:25]:
            line(pdf, f'- {i.get("type", "")}: {i.get("indicator", "")} ({i.get("risk", "")})')

    pdf.output(out_path)
    return out_path