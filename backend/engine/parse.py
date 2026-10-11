import re
import json
import hashlib
import ipaddress
from email import policy
from email.parser import BytesParser
from email.utils import parseaddr

URL_RE = re.compile(r"https?://[^\s<>\"'{}|\\^`]+", re.I)
IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def public_ip(text):
    # First public IPv4 in a string. Private ranges (10.x, 192.168.x, 127.x) are skipped.
    for candidate in IP_RE.findall(text or ""):
        try:
            if ipaddress.ip_address(candidate).is_global:
                return candidate
        except ValueError:
            pass
    return None


def parse_hops(msg):
    # Received headers are written newest-first, so we reverse them: hop 1 = where the mail started.
    hops = []
    for value in reversed(msg.get_all("Received", [])):
        value = " ".join(str(value).split())
        # Only look before "by": that part describes the machine that SENT to the next server
        from_part = re.split(r"\sby\s", value, maxsplit=1)[0]
        ip = public_ip(from_part)
        if not ip:
            continue
        host = re.search(r"from\s+(\S+)", from_part, re.I)
        by = re.search(r"\sby\s+(\S+)", value, re.I)
        hops.append({
            "hopNumber": len(hops) + 1,
            "ip": ip,
            "hostname": host.group(1) if host else None,
            "by": by.group(1).rstrip(";") if by else None,
        })
    return hops


def parse_auth(msg, sender_domain, origin_ip):
    # Reads the SPF/DKIM/DMARC verdicts that the receiving server (Gmail) already wrote in the headers.
    # No header = "NONE". We never guess a result.
    low = " ".join(str(v) for v in msg.get_all("Authentication-Results", [])).lower()

    def pick(name, options):
        for opt in options:
            if f"{name}={opt}" in low:
                return opt.upper()
        return "NONE"

    selector = re.search(r"header\.s=([\w.-]+)", low)
    dkim_domain = re.search(r"header\.d=([\w.-]+)", low) or re.search(r"header\.i=@([\w.-]+)", low)
    policy_m = re.search(r"dmarc=\w+\s*\(p=(\w+)", low)

    spf = pick("spf", ["pass", "fail", "softfail"])
    dkim = pick("dkim", ["pass", "fail"])
    dmarc = pick("dmarc", ["pass", "fail"])

    return {
        "spf": {"status": spf, "domain": sender_domain, "ip": origin_ip or "Unknown",
                "details": {"PASS": "Sender IP address matches authorized SPF record.",
                            "FAIL": "Sender IP is not permitted to send on behalf of this domain.",
                            "SOFTFAIL": "Domain owner marked this sender IP as questionable (~all)."}.get(
                    spf, "No SPF result found in the message headers.")},
        "dkim": {"status": dkim, "selector": selector.group(1) if selector else "n/a",
                 "domain": dkim_domain.group(1) if dkim_domain else sender_domain,
                 "details": {"PASS": "Valid cryptographic signature verified against DNS public key.",
                             "FAIL": "Signature verification failed; message integrity cannot be trusted."}.get(
                     dkim, "No DKIM result found in the message headers.")},
        "dmarc": {"status": dmarc, "policy": f"p={policy_m.group(1)}" if policy_m else "p=none",
                  "details": {"PASS": "DMARC policy aligned and verified.",
                              "FAIL": "DMARC policy failed. Elevated probability of address spoofing."}.get(
                      dmarc, "No DMARC result found in the message headers.")},
    }


def parse_email_bytes(raw):
    msg = BytesParser(policy=policy.default).parsebytes(raw)

    text_parts, html_parts = [], []
    attachments = []
    for part in msg.walk():
        ctype = part.get_content_type()
        if part.get_filename():
            data = part.get_payload(decode=True) or b""
            attachments.append({
                "filename": part.get_filename(),
                "contentType": ctype,
                "size": len(data),
                "sha256": hashlib.sha256(data).hexdigest(),  # evidence fingerprint
            })
        elif ctype == "text/plain":
            text_parts.append(part.get_content())
        elif ctype == "text/html":
            html_parts.append(part.get_content())

    html_text = "\n".join(html_parts)
    # Readable text: plain part if present, otherwise the HTML with tags removed
    body = "\n".join(text_parts) or re.sub(r"<[^>]+>", " ", html_text)

    # URLs come from both plain text and HTML (links live inside href="...")
    urls = []
    for u in URL_RE.findall("\n".join(text_parts) + "\n" + html_text):
        u = u.rstrip(".,;:!?)]}'\"")
        if u not in urls:
            urls.append(u)

    raw_text = raw.decode("utf-8", "replace")
    raw_headers = re.split(r"\r?\n\r?\n", raw_text, maxsplit=1)[0]

    from_name, from_email = parseaddr(str(msg["From"] or ""))
    sender_domain = from_email.split("@")[1].lower() if "@" in from_email else ""
    hops = parse_hops(msg)

    x_ip = str(msg["X-Originating-IP"] or "").strip("[] ")
    origin_ip = x_ip or (hops[0]["ip"] if hops else "")

    headers = {
        "from": str(msg["From"] or "Unknown Sender"),
        "fromDisplayName": from_name or from_email,
        "fromEmail": from_email,
        "to": str(msg["To"] or "Undisclosed Recipients"),
        "replyTo": str(msg["Reply-To"]) if msg["Reply-To"] else None,
        "returnPath": str(msg["Return-Path"]) if msg["Return-Path"] else None,
        "messageId": str(msg["Message-ID"] or ""),
        "date": str(msg["Date"] or ""),
        "subject": str(msg["Subject"] or "(No Subject)"),
        "mimeVersion": str(msg["MIME-Version"]) if msg["MIME-Version"] else None,
        "contentType": str(msg["Content-Type"]) if msg["Content-Type"] else None,
        "userAgent": str(msg["User-Agent"] or msg["X-Mailer"] or "") or None,
        "xOriginatingIp": origin_ip or "Unknown",
        "rawHeaders": raw_headers,
    }

    return {
        "headers": headers,
        "senderDomain": sender_domain,
        "hops": hops,
        "authentication": parse_auth(msg, sender_domain, origin_ip),
        "urls": urls,
        "attachments": attachments,
        "body": body.strip(),
        "html": html_text,
    }


if __name__ == "__main__":
    import sys
    with open(sys.argv[1], "rb") as f:
        print(json.dumps(parse_email_bytes(f.read()), indent=2))