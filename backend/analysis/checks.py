import re
from app.ingestion.parser import parse_email

URGENT = ["urgent", "verify", "suspended", "closed", "immediately",
          "confirm your", "password", "24 hours"]
BAD_FILES = (".exe", ".js", ".scr", ".bat", ".docm", ".xlsm", ".zip")

# Brands that scammers copy. Add more as you like.
BRANDS = ["paypal", "microsoft", "google", "amazon", "apple", "netflix", "facebook",
          "instagram", "linkedin", "dropbox", "docusign", "paytm", "flipkart",
          "sbi", "hdfc", "icici"]

# Real domains that must never be flagged as fake
TRUSTED = {"google.com", "gmail.com", "microsoft.com", "outlook.com", "office.com",
           "amazon.com", "amazonaws.com", "apple.com", "linkedin.com", "github.com",
           "youtube.com", "googleusercontent.com", "paypal.com", "facebook.com"}


def domain(addr):
    m = re.search(r"@([\w.-]+)", addr or "")
    return m.group(1).lower() if m else None


def registered(d):
    # mail.company.com and company.com count as the same company
    return ".".join(d.split(".")[-2:]) if d else None


def unmask(text):
    # Turns lookalike characters back into letters: paypa1 -> paypal, micros0ft -> microsoft
    text = text.replace("rn", "m")
    return text.translate(str.maketrans({"0": "o", "1": "l", "3": "e", "4": "a", "5": "s"}))


def fake_brand(host):
    reg = registered(host)
    if reg in TRUSTED:
        return None
    name = reg.split(".")[0]
    for brand in BRANDS:
        # Contains a brand name but is not exactly that brand = likely fake
        if brand in unmask(name) and name != brand:
            return brand
    return None


def run_checks(email):
    findings = []
    f = registered(domain(email["from"]))
    r = registered(domain(email["reply_to"]))
    rp = registered(domain(email["return_path"]))

    if f and r and f != r:
        findings.append({"severity": 30, "detail": f"Reply-To domain ({r}) is different from sender domain ({f})"})
    if f and rp and f != rp:
        findings.append({"severity": 20, "detail": f"Return-Path domain ({rp}) is different from sender domain ({f})"})

    seen = set()
    insecure = 0
    for link in email["links"]:
        m = re.search(r"https?://([^/:?#]+)", link)
        if not m:
            continue
        host = m.group(1).lower()
        brand = fake_brand(host)
        if brand and host not in seen:
            seen.add(host)
            findings.append({"severity": 30, "detail": f"Link pretends to be {brand}: {host}"})
        if link.startswith("http://"):
            insecure += 1
    if insecure:
        findings.append({"severity": 10, "detail": f"{insecure} link(s) are not secure (http)"})

    text = ((email["subject"] or "") + " " + email["body"]).lower()
    found = [w for w in URGENT if w in text]
    # One normal word like "password" is fine. Two or more together look like pressure.
    if len(found) >= 2:
        findings.append({"severity": min(10 * len(found), 30), "detail": "Urgent or pressure words: " + ", ".join(found)})

    for a in email["attachments"]:
        if a and a.lower().endswith(BAD_FILES):
            findings.append({"severity": 40, "detail": f"Risky attachment: {a}"})

    return findings


if __name__ == "__main__":
    import sys
    email = parse_email(sys.argv[1])
    for item in run_checks(email):
        print(item["severity"], "-", item["detail"])