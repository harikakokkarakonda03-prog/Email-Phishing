import re
from email import policy
from email.parser import BytesParser

def parse_email(path):
    with open(path, "rb") as f:
        msg = BytesParser(policy=policy.default).parse(f)

    part = msg.get_body(preferencelist=("plain", "html"))
    body = part.get_content() if part else ""

    ips = []
    for line in msg.get_all("Received", []):
        ips += re.findall(r"(\d{1,3}(?:\.\d{1,3}){3})", line)

    return {
        "from": msg["From"],
        "reply_to": msg["Reply-To"],
        "return_path": msg["Return-Path"],
        "subject": msg["Subject"],
        "date": msg["Date"],
        "sender_ip": ips[-1] if ips else None,
        "links": re.findall(r"https?://[^\s\"'<>]+", body),
        "attachments": [p.get_filename() for p in msg.iter_attachments()],
        "body": body,
    }

if __name__ == "__main__":
    import sys, json
    print(json.dumps(parse_email(sys.argv[1]), indent=2))