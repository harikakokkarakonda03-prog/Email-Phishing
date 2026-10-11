from app.ingestion.parser import parse_email
from analysis.checks import run_checks
from analysis.geolocation import locate_ip

def analyze_email(path):
    email = parse_email(path)
    findings = run_checks(email)
    location = locate_ip(email["sender_ip"])

    score = min(sum(f["severity"] for f in findings), 100)

    if score >= 80:
        verdict = "Critical"
    elif score >= 60:
        verdict = "High"
    elif score >= 30:
        verdict = "Medium"
    elif score > 0:
        verdict = "Low"
    else:
        verdict = "Safe"

    return {
        "subject": email["subject"],
        "sender": email["from"],
        "sender_ip": email["sender_ip"],
        "location": location,
        "danger_percent": score,
        "verdict": verdict,
        "findings": findings,
    }

if __name__ == "__main__":
    import sys, json
    print(json.dumps(analyze_email(sys.argv[1]), indent=2))