import re
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from urllib.parse import urlparse

from engine.parse import parse_email_bytes
from engine.ipintel import build_path
from engine.domain import analyze_domain, registered_domain, BRANDS, TRUSTED

SENSITIVE = ["login", "signin", "verify", "account", "secure", "security", "update",
             "password", "reset", "billing", "wallet", "unlock", "confirm"]
URGENT = ["suspended", "suspension", "within 24 hours", "unauthorized", "action required",
          "wire transfer", "advance fee", "confidential", "verify your account", "password expired",
          "reset immediately", "fraudulent attempt", "legal action", "account will be closed",
          "gift card", "act now"]
SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "ow.ly", "is.gd", "cutt.ly", "rb.gy", "goo.gl"}
EXEC_EXT = (".exe", ".scr", ".bat", ".cmd", ".vbs", ".js", ".jar", ".ps1", ".msi", ".lnk", ".apk", ".iso")
MACRO_EXT = (".docm", ".xlsm", ".pptm")
ARCHIVE_EXT = (".zip", ".rar", ".7z")
DOUBLE_EXT = re.compile(r"\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|txt)\.(exe|scr|bat|cmd|vbs|js|jar|ps1|lnk)$", re.I)
ANCHOR_RE = re.compile(r'<a\s[^>]*?href\s*=\s*["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.I | re.S)
TEXT_DOMAIN_RE = re.compile(r"(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)
IPV4 = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")


def defang(url):
    # hxxp://paypa1-secure[.]com : safe to display and copy
    return re.sub(r"^https?://", lambda m: "hxxps://" if m.group(0).lower() == "https://" else "hxxp://", url).replace(".", "[.]")


def clock(ts):
    return datetime.fromtimestamp(ts).strftime("%I:%M:%S %p")


def clean(d):
    # The frontend expects missing values to be absent, not null
    return {k: v for k, v in d.items() if v is not None}


def level(score):
    return "CRITICAL" if score >= 81 else "HIGH" if score >= 61 else "MEDIUM" if score >= 31 else "LOW"


def analyze_email(raw, file_name=None):
    marks = {}
    marks["start"] = time.time()
    parsed = parse_email_bytes(raw)
    h = parsed["headers"]
    sender_domain = parsed["senderDomain"]
    sender_reg = registered_domain(sender_domain) if sender_domain else ""
    reasons, score = [], 0

    def add(rid, title, severity, evidence, category, weight):

        nonlocal score
        reasons.append({"id": rid, "title": title, "severity": severity, "evidence": evidence,
                        "category": category, "weight": weight})
        score += weight

    # ---- 1. Relay path and sender IP (real lookups)
    path = build_path(parsed["hops"])
    marks["ip"] = time.time()
    origin = path[0] if path else None
    if origin and origin["isSuspicious"]:
        add("reason-ip-reputation", "Sender IP comes from a proxy, VPN or Tor network", "HIGH",
            f'Originating IP {origin["ip"]} is on {origin["isp"]} ({origin["asn"]}), flagged as an anonymizing proxy.',
            "IP_REPUTATION", 15)

    # ---- 2. Sender domain (real registration data + lookalike check)
    domain_items = []
    sender_intel = None
    if sender_domain:
        sender_intel = analyze_domain(sender_domain)
        domain_items.append(sender_intel)
        if sender_intel["reputation"] == "MALICIOUS":
            add("reason-domain-malicious", "Sender domain imitates a trusted organization", "CRITICAL",
                sender_intel["similarityReason"], "DOMAIN", 35)
        elif sender_intel["reputation"] == "SUSPICIOUS":
            add("reason-domain-suspicious", "Sender domain has suspicious indicators", "HIGH",
                sender_intel["similarityReason"], "DOMAIN", 20)
        if 0 <= sender_intel["ageDays"] <= 14:
            add("reason-domain-age", "Sender domain was registered less than 14 days ago", "HIGH",
                f'Registered on {sender_intel["creationDate"][:10]} ({sender_intel["ageDays"]} days ago).', "DOMAIN", 10)
    marks["domain"] = time.time()

    # ---- 3. Authentication (taken from the real headers, never guessed)
    auth = parsed["authentication"]
    ip_txt = h["xOriginatingIp"]
    if auth["spf"]["status"] == "FAIL":
        add("reason-spf-fail", "SPF check failed (sender IP not authorized)", "CRITICAL",
            f"IP {ip_txt} is not allowed to send mail for {sender_domain}.", "AUTHENTICATION", 20)
    elif auth["spf"]["status"] == "SOFTFAIL":
        add("reason-spf-softfail", "SPF check soft-failed", "MEDIUM",
            f"The owner of {sender_domain} marked IP {ip_txt} as questionable.", "AUTHENTICATION", 10)
    if auth["dkim"]["status"] == "FAIL":
        add("reason-dkim-fail", "DKIM signature check failed", "HIGH",
            "The cryptographic signature is invalid, so the message may have been altered or forged.", "AUTHENTICATION", 15)
    if auth["dmarc"]["status"] == "FAIL":
        add("reason-dmarc-fail", "DMARC check failed", "HIGH",
            f'Neither SPF nor DKIM matched the visible sender "{sender_domain}".', "AUTHENTICATION", 15)
    marks["auth"] = time.time()

    # ---- 4. Who the sender claims to be vs where replies go
    reply_diverges = False
    if h.get("replyTo"):
        m = re.search(r"@([\w.-]+)", h["replyTo"])
        if m and sender_reg and registered_domain(m.group(1).lower()) != sender_reg:
            reply_diverges = True
            add("reason-replyto-divergence", "Replies are redirected to a different domain", "CRITICAL",
                f'Sender is "{h["fromEmail"]}" but replies go to "{h["replyTo"]}".', "AUTHENTICATION", 25)
    if h.get("returnPath") and auth["spf"]["status"] != "PASS":
        m = re.search(r"@([\w.-]+)", h["returnPath"])
        if m and sender_reg and registered_domain(m.group(1).lower()) != sender_reg:
            add("reason-returnpath", "Return-Path domain differs from the sender", "MEDIUM",
                f'Bounce address uses "{m.group(1)}" while the sender is "{sender_domain}".', "AUTHENTICATION", 10)

    impersonated = None
    tokens = re.findall(r"[a-z0-9]+", (h["fromDisplayName"] or "").lower())
    joined = "".join(tokens)
    for brand, official in BRANDS.items():
        if (brand in tokens or (len(brand) >= 6 and brand in joined)) and sender_reg not in TRUSTED and sender_reg != official:
            impersonated = brand
            add("reason-display-name", f'Display name pretends to be "{brand}"', "HIGH",
                f'The name says "{h["fromDisplayName"]}" but the address belongs to "{sender_reg}", not {official}.',
                "DOMAIN", 20)
            break

    # ---- 5. Links
    # Look up all link domains at the same time. The slow part is waiting for the network,
    # so this makes the verdict arrive in seconds. Results are cached for the loop below.
        url_items, flags = [], {"lookalike": False, "high": False, "weak": False, "login": False}
    seen_hosts = {sender_domain} # <--- Type this exact line here with 4 spaces matching the line below it!
    link_hosts = {(urlparse(u).hostname or "").lower() for u in parsed["urls"][:15]}
    link_hosts = [x for x in link_hosts if x and not IPV4.match(x)]
    if link_hosts:
        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(analyze_domain, link_hosts))
    for i, url in enumerate(parsed["urls"][:15]):
        host = (urlparse(url).hostname or "").lower()
        if not host:
            continue
        is_ip = bool(IPV4.match(host))
        is_http = url.lower().startswith("http://")
        is_short = host in SHORTENERS
        has_sensitive = any(k in urlparse(url).path.lower() + urlparse(url).query.lower() for k in SENSITIVE)
        intel = None if is_ip else analyze_domain(host)
        if intel and host not in seen_hosts:
            seen_hosts.add(host)
            domain_items.append(intel)

        risk, why = "LOW", "Standard web link."
        if is_ip:
            risk, why = "CRITICAL", "Raw IP address used as the link host (avoids domain filters)."
            flags["lookalike"] = True
        elif intel["reputation"] == "MALICIOUS":
            risk, why = "CRITICAL", intel["similarityReason"]
            flags["lookalike"] = True
        elif intel["reputation"] == "SUSPICIOUS":
            risk, why = "HIGH", intel["similarityReason"]
            flags["high"] = True
        elif is_http and has_sensitive:
            risk, why = "HIGH", "Unencrypted HTTP link on a page that asks for login or account details."
            flags["high"] = True
        elif is_short:
            risk, why = "MEDIUM", "URL shortener hides the final destination."
            flags["weak"] = True
        elif is_http:
            risk, why = "MEDIUM", "Unencrypted HTTP link."
            flags["weak"] = True
        if has_sensitive and risk in ("CRITICAL", "HIGH"):
            flags["login"] = True

        url_items.append({
            "id": f"url-{i + 1}", "url": url, "defanged": defang(url), "domain": host,
            "protocol": "HTTP" if is_http else "HTTPS", "redirectChain": [url], "risk": risk,
            "reason": why, "isLookalike": bool(intel and intel.get("lookalikeTarget")),
            "isIpBased": is_ip, "isShortener": is_short,
        })

    if flags["lookalike"]:
        add("reason-url-typosquat", "Link points to an imitation domain or a raw IP address", "CRITICAL",
            "At least one link leads to a website built to imitate a trusted brand or hide its identity.", "URL", 25)
    elif flags["high"]:
        add("reason-url-high", "Link has high-risk indicators", "HIGH",
            "A link goes to a young or risky domain, or asks for login details over plain HTTP.", "URL", 15)
    elif flags["weak"]:
        add("reason-url-weak", "Link uses HTTP or a URL shortener", "MEDIUM",
            "Plain HTTP and shorteners are common in scams, but also in harmless mail.", "URL", 8)

    # Link text that shows one website but goes to another
    for href, text in ANCHOR_RE.findall(parsed["html"]):
        shown = re.sub(r"<[^>]+>", " ", text)
        m = TEXT_DOMAIN_RE.search(shown)
        target = (urlparse(href).hostname or "").lower()
        if m and target and registered_domain(m.group(1).lower()) != registered_domain(target):
            brandish = registered_domain(m.group(1).lower()) in TRUSTED
            add("reason-link-mismatch", "A link shows one website but opens another", "HIGH" if brandish else "MEDIUM",
                f'The visible text says "{m.group(1)}" but the link goes to "{target}".', "URL", 15 if brandish else 8)
            break
    marks["url"] = time.time()

    # ---- 6. Attachments
    iocs = []
    malware = False
    for a in parsed["attachments"]:
        name = (a["filename"] or "").lower()
        bad = False
        if DOUBLE_EXT.search(name):
            malware = bad = True
            add("reason-att-double", "Attachment hides an executable behind a fake extension", "CRITICAL",
                f'"{a["filename"]}" looks like a document but is a program.', "ATTACHMENT", 65)
        elif name.endswith(EXEC_EXT):
            malware = bad = True
            add("reason-att-exec", "Executable attachment", "CRITICAL",
                f'"{a["filename"]}" can run code on the computer that opens it.', "ATTACHMENT", 60)
        elif name.endswith(MACRO_EXT):
            malware = bad = True
            add("reason-att-macro", "Office file with macros", "HIGH",
                f'"{a["filename"]}" can contain macros, a common way to install malware.', "ATTACHMENT", 35)
        elif name.endswith(ARCHIVE_EXT):
            add("reason-att-archive", "Compressed attachment", "MEDIUM",
                f'"{a["filename"]}" is an archive that can hide dangerous files.', "ATTACHMENT", 10)
        iocs.append({"id": f"ioc-att-{len(iocs)}", "type": "Attachment", "indicator": a["filename"],
                     "risk": "CRITICAL" if bad else "LOW", "reason": f'{a["contentType"]}, {a["size"]} bytes'})
        iocs.append({"id": f"ioc-hash-{len(iocs)}", "type": "Hash", "indicator": a["sha256"],
                     "risk": "CRITICAL" if bad else "LOW", "reason": f'SHA-256 of "{a["filename"]}"'})

    # ---- 7. Pressure words
    text = f'{h["subject"]} {parsed["body"]}'.lower()
    hits = [k for k in URGENT if k in text]
    if hits:
        add("reason-social-eng", "Urgent pressure language", "HIGH" if len(hits) >= 2 else "MEDIUM",
            "Pressure phrases found: " + ", ".join(f'"{k}"' for k in hits) + ".", "BODY_CONTENT", min(20, 8 * len(hits)))

    # ---- 8. Final score, class and category
    score = max(0, min(100, score))
    risk_level = level(score)
    if score >= 81:
        classification = "CRITICAL – MALWARE ATTACHMENT" if malware else "CRITICAL – PHISHING"
    elif score >= 61:
        if malware:
            classification = "HIGH – MALWARE ATTACHMENT"
        else:
            classification = "HIGH – BUSINESS EMAIL COMPROMISE (BEC)" if (reply_diverges or impersonated) else "HIGH – SUSPICIOUS / SPOOFED"
    elif score >= 31:
        classification = "MEDIUM – SUSPICIOUS"
    else:
        classification = "LOW – CLEAN / AUTHENTICATED"

    if score < 31:
        category = "Clean"
    elif malware:
        category = "Malware Attachment"
    elif flags["lookalike"] and flags["login"]:
        category = "Credential Harvesting"
    elif reply_diverges or impersonated:
        category = "BEC / Impersonation"
    elif hits and not (flags["lookalike"] or flags["high"]):
        category = "Spam / Scam"
    else:
        category = "Phishing"

    # ---- 9. Indicators of compromise
    for hop in path:
        if not (hop["isSuspicious"] or score >= 31):
            continue                       # harmless relays are not indicators of compromise
        iocs.append({"id": f'ioc-ip-{hop["hopNumber"]}', "type": "IP", "indicator": hop["ip"],
                     "risk": "HIGH" if hop["isSuspicious"] else "LOW",
                     "reason": ("Originating sender relay" if hop["isSenderOrigin"] else "Intermediate relay")
                               + f' ({hop["isp"]}, {hop["country"]})'})
    for i, d in enumerate(domain_items):
        if d["reputation"] != "SAFE":
            iocs.append({"id": f"ioc-dom-{i}", "type": "Domain", "indicator": d["domain"],
                         "risk": "CRITICAL" if d["reputation"] == "MALICIOUS" else "HIGH", "reason": d["similarityReason"]})
    for i, u in enumerate(url_items):
        if u["risk"] != "LOW":
            iocs.append({"id": f"ioc-url-{i}", "type": "URL", "indicator": u["url"], "risk": u["risk"], "reason": u["reason"]})
    if score >= 31 and h["fromEmail"]:
        iocs.append({"id": "ioc-email-from", "type": "Email", "indicator": h["fromEmail"], "risk": "HIGH",
                     "reason": "Sender address of a suspicious message"})
        if reply_diverges:
            iocs.append({"id": "ioc-email-reply", "type": "Email", "indicator": h["replyTo"], "risk": "HIGH",
                         "reason": "Replies are redirected to this address"})

    # ---- 10. Timeline (real clock times of each stage)
    t = marks
    sip = origin or {}
    spf, dkim, dmarc = auth["spf"]["status"], auth["dkim"]["status"], auth["dmarc"]["status"]
    now = time.time()
    timeline = [
        {"time": clock(t["start"]), "stage": "Email Received",
         "description": f'Ingested email with subject "{h["subject"][:45]}".', "status": "COMPLETED"},
        {"time": clock(t["start"]), "stage": "Header Forensics",
         "description": f'Parsed headers and {len(path)} relay hop(s). Originating IP: [{ip_txt}].', "status": "COMPLETED"},
        {"time": clock(t["ip"]), "stage": "IP Intelligence Extracted",
         "description": (f'Mapped origin to {sip.get("city")}, {sip.get("country")} ({sip.get("asn")}).'
                         if origin else "No public relay IP found in the headers."),
         "status": "FLAGGED" if origin and origin["isSuspicious"] else "COMPLETED"},
        {"time": clock(t["domain"]), "stage": "Domain & Typosquatting Analysis",
         "description": f'Evaluated "{sender_domain or "unknown"}" and {len(domain_items) - 1 if domain_items else 0} link domain(s).',
         "status": "FLAGGED" if any(d["reputation"] != "SAFE" for d in domain_items) else "COMPLETED"},
        {"time": clock(t["auth"]), "stage": "Cryptographic Authentication",
         "description": f"SPF={spf}, DKIM={dkim}, DMARC={dmarc}.",
         "status": "FLAGGED" if "FAIL" in (spf, dkim, dmarc) or "SOFTFAIL" == spf else "COMPLETED"},
        {"time": clock(t["url"]), "stage": "Link & Attachment Inspection",
         "description": f'Checked {len(url_items)} link(s) and {len(parsed["attachments"])} attachment(s).',
         "status": "FLAGGED" if flags["lookalike"] or flags["high"] or malware else "COMPLETED"},
        {"time": clock(now), "stage": "Threat Score Computed",
         "description": f"Explainable risk score: {score}/100 ({classification}).",
         "status": "FLAGGED" if score >= 60 else "COMPLETED"},
        {"time": clock(now), "stage": "Forensic Investigation Finalized",
         "description": "Report compiled with extracted indicators and the evidence trail.", "status": "COMPLETED"},
    ]

    if score >= 60:
        summary = (f"Security incident flagged as {classification} (Threat Score {score}/100). "
                   f"{len(reasons)} risk factor(s) found across {len({r['category'] for r in reasons})} area(s).")
    elif score >= 31:
        summary = f"Email flagged for review (Threat Score {score}/100) with {len(reasons)} risk factor(s)."
    else:
        summary = f"Email shows low risk (Threat Score {score}/100). No strong phishing or malware indicators found."

    return {
        "id": "PENDING",                                   # the database assigns the real INV id
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "fileName": file_name or "scanned_email.eml",
        "subject": h["subject"],
        "sender": h["from"],
        "recipient": h["to"],
        "threatScore": score,
        "riskLevel": risk_level,
        "classification": classification,
        "category": category,
        "summary": summary,
        "emailHeaders": clean(h),
        "authentication": auth,
        "transmissionPath": [{k: v for k, v in hop.items() if not (k in ("hostname", "by") and v is None)} for hop in path],
        "urls": url_items,
        "domainIntelligence": [clean(d) for d in domain_items],
        "explainableReasons": reasons,
        "iocs": iocs,
        "timeline": timeline,
        "emailBody": parsed["body"],
    }


if __name__ == "__main__":
    import sys, json
    with open(sys.argv[1], "rb") as f:
        r = analyze_email(f.read(), sys.argv[1])
    if "--json" in sys.argv:
        print(json.dumps(r, indent=2))          # the full result the frontend will receive
    else:
        print(f'{r["threatScore"]}/100  {r["riskLevel"]}  |  {r["classification"]}  |  category: {r["category"]}')
        for x in r["explainableReasons"]:
            print(f'  [{x["weight"]:>2}] {x["severity"]:8} {x["title"]}')
        print("  indicators:", len(r["iocs"]), "| links:", len(r["urls"]), "| relay hops:", len(r["transmissionPath"]))