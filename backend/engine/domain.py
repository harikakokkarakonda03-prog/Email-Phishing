import re
import json
import requests
from datetime import datetime, timezone

RDAP = "https://rdap.org/domain/{domain}"  # free, no key; redirects to the right registry

# Brands that scammers copy -> their real domain
BRANDS = {
    "paypal": "paypal.com", "microsoft": "microsoft.com", "google": "google.com",
    "apple": "apple.com", "amazon": "amazon.com", "netflix": "netflix.com",
    "facebook": "facebook.com", "instagram": "instagram.com", "linkedin": "linkedin.com",
    "dropbox": "dropbox.com", "docusign": "docusign.com", "whatsapp": "whatsapp.com",
    "chase": "chase.com", "wellsfargo": "wellsfargo.com", "bankofamerica": "bankofamerica.com",
    "citibank": "citibank.com", "hdfcbank": "hdfcbank.com", "icicibank": "icicibank.com",
    "sbi": "sbi.co.in", "paytm": "paytm.com", "flipkart": "flipkart.com",
    "irctc": "irctc.co.in", "github": "github.com",
}
# Other genuine domains owned by those brands (never flagged as fake)
EXTRA_TRUSTED = {"gmail.com", "youtube.com", "outlook.com", "live.com", "office.com", "office365.com",
                 "microsoftonline.com", "icloud.com", "amazonaws.com", "googleusercontent.com",
                 "googlemail.com", "gstatic.com", "fb.com", "paypal.me"}
TRUSTED = set(BRANDS.values()) | EXTRA_TRUSTED

# Cheap top-level domains that attackers use a lot
RISKY_TLDS = {"xyz", "top", "click", "icu", "cfd", "sbs", "gdn", "buzz", "cam", "live", "shop",
              "monster", "quest", "rest", "surf", "fit", "beauty", "zip", "mov"}
SECOND_LEVEL = {"co", "com", "org", "net", "gov", "edu", "ac", "nic", "res", "mil"}

_cache = {}


def registered_domain(host):
    # mail.google.com -> google.com ; portal.sbi.co.in -> sbi.co.in
    parts = host.lower().strip(".").split(".")
    if len(parts) >= 3 and len(parts[-1]) == 2 and parts[-2] in SECOND_LEVEL:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def levenshtein(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def unmask_variants(text):
    # Turns look-alike characters back into letters: paypa1 -> paypal, micros0ft -> microsoft
    base = text.replace("rn", "m").replace("vv", "w")
    table_l = str.maketrans({"0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "$": "s"})
    table_i = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "$": "s"})
    return {text, base.translate(table_l), base.translate(table_i)}


def find_lookalike(host, reg):
    # Returns (brand_domain, reason) if the host imitates a known brand, else None.
    if reg in TRUSTED:
        return None
    label = reg.split(".")[0]
    sub_labels = host[: -len(reg)].strip(".").split(".") if host != reg else []
    tokens = set()
    for variant in unmask_variants(label):
        tokens.update(variant.split("-"))
        tokens.add(variant)
    for s in sub_labels:                      # paypal.com.evil.xyz -> brand hidden in the subdomain
        tokens.update(s.split("-"))

    for brand, official in BRANDS.items():
        if brand in sub_labels or brand in tokens:
            how = "uses the brand name inside an unrelated domain"
            if label not in tokens or brand not in label:
                how = "puts the brand name in a subdomain of an unrelated domain"
            if any(v != label and brand in v for v in unmask_variants(label)):
                how = "uses look-alike characters to imitate the brand (e.g. 1 for l, 0 for o)"
            return official, f'Domain "{reg}" {how}: {official}.'
        if len(brand) >= 6:                   # long brands: also catch hidden or typo versions
            for t in tokens:
                if brand in t and t != brand:
                    return official, f'Domain "{reg}" contains the brand name "{brand}" but is not {official}.'
                if len(t) >= 6 and 0 < levenshtein(t, brand) <= 1:
                    return official, f'Domain "{reg}" is a typo of "{brand}" ({official}).'
    return None


def rdap_lookup(reg):
    # Real registration data. Returns None if the registry gives no answer.
    if reg in _cache:
        return _cache[reg]
    out = None
    try:
        r = requests.get(RDAP.format(domain=reg), timeout=6)
        if r.status_code == 200:
            out = parse_rdap(r.json())
    except Exception:
        pass
    _cache[reg] = out
    return out


def parse_rdap(j):
    events = {e.get("eventAction"): e.get("eventDate") for e in j.get("events", [])}
    registrar = None
    for ent in j.get("entities", []):
        if "registrar" in ent.get("roles", []):
            for item in (ent.get("vcardArray") or [None, []])[1]:
                if item[0] == "fn":
                    registrar = item[3]
    return {
        "registrar": registrar or "Unknown",
        "created": events.get("registration"),
        "expires": events.get("expiration"),
        "nameservers": sorted({n.get("ldhName", "").lower() for n in j.get("nameservers", []) if n.get("ldhName")}),
    }


def age_in_days(iso):
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        return max(0, (datetime.now(timezone.utc) - d).days)
    except Exception:
        return None


def analyze_domain(host):
    host = host.lower().strip().strip(".")
    reg = registered_domain(host)
    tld = reg.split(".")[-1]
    info = rdap_lookup(reg)
    age = age_in_days(info["created"]) if info and info.get("created") else None

    score, notes = 0, []
    lookalike = find_lookalike(host, reg)
    if lookalike:
        score += 70
        notes.append(lookalike[1])
    if tld in RISKY_TLDS:
        score += 20
        notes.append(f'".{tld}" is a top-level domain often abused by attackers.')
    if any(l.startswith("xn--") for l in host.split(".")):
        score += 35
        notes.append("Internationalized (punycode) domain: may hide look-alike non-Latin letters.")
    if age is not None:
        if age <= 14:
            score += 35
            notes.append(f"Newly registered domain ({age} days old).")
        elif age <= 30:
            score += 25
            notes.append(f"Recently registered domain ({age} days old).")
        elif age <= 90:
            score += 10
            notes.append(f"Young domain ({age} days old).")

    if reg in TRUSTED:
        score, notes = 2, [f"Genuine domain of a known brand ({reg})."]
    elif not notes:
        score = 5
        notes = ["No impersonation or high-risk indicators found."]
        if age is None:
            notes.append("Registration date could not be retrieved.")

    score = min(100, score)
    return {
        "domain": host,
        "registrar": info["registrar"] if info else "Unknown",
        "creationDate": info["created"] if info and info.get("created") else "Unknown",
        "expiryDate": info["expires"] if info and info.get("expires") else "Unknown",
        "ageDays": age if age is not None else -1,   # -1 = unknown (the frontend must show "Unknown")
        "nameservers": info["nameservers"] if info else [],
        "tld": "." + tld,
        "riskScore": score,
        "reputation": "MALICIOUS" if score >= 70 else "SUSPICIOUS" if score >= 35 else "SAFE",
        "lookalikeTarget": lookalike[0] if lookalike else None,
        "similarityReason": " ".join(notes),
    }


if __name__ == "__main__":
    import sys
    for d in sys.argv[1:]:
        print(json.dumps(analyze_domain(d), indent=2))