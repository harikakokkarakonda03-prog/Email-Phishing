import json
import requests

# Free service, no key needed. Limit: about 45 requests per minute (plenty for a demo).
# Free plan works over plain http only.
API = "http://ip-api.com/json/{ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp,as,proxy,hosting"
# Big mail providers are sometimes flagged "proxy" because they relay mail for millions of users.
# Their relay servers must not be treated as attackers.
TRUSTED_ASNS = {"AS15169", "AS8075", "AS8068", "AS8069", "AS16509", "AS14618", "AS36647", "AS26101", "AS714"}
_cache = {}  # same IP is looked up only once, which protects the free rate limit


def lookup_ip(ip):
    # Returns real location and network info for an IP, or None if the lookup fails.
    if ip in _cache:
        return _cache[ip]
    try:
        d = requests.get(API.format(ip=ip), timeout=5).json()
        if d.get("status") != "success":
            data = None
        else:
            proxy = bool(d.get("proxy"))  # VPN, proxy or Tor exit node
            asn = (d.get("as") or "AS?").split(" ")[0]
            suspicious = proxy and asn not in TRUSTED_ASNS
            data = {
                "country": d["country"],
                "countryCode": d["countryCode"],
                "city": d["city"] or d["regionName"] or "Unknown",
                "isp": d["isp"] or "Unknown",
                "asn": asn,
                "latitude": d["lat"],
                "longitude": d["lon"],
                "hosting": bool(d.get("hosting")),
                "proxy": proxy,
                # Only proxy/VPN/Tor from an unknown network is suspicious.
                # Hosting alone is NOT, because normal mail servers run on hosting networks.
                "riskLevel": "HIGH" if suspicious else "LOW",
                "isSuspicious": suspicious,
            }
    except Exception:
        data = None
    _cache[ip] = data
    return data


def build_path(hops):
    # Adds location and risk to each relay hop, in the shape the ThreatMailer map expects.
    path = []
    for i, hop in enumerate(hops):
        info = lookup_ip(hop["ip"])
        item = {
            "hopNumber": hop["hopNumber"],
            "ip": hop["ip"],
            "hostname": hop.get("hostname"),
            "by": hop.get("by"),
            "isSenderOrigin": i == 0,  # first relay = where the email started
        }
        if info:
            item.update({k: info[k] for k in
                         ["country", "countryCode", "city", "isp", "asn",
                          "latitude", "longitude", "riskLevel", "isSuspicious"]})
        else:
            # Lookup failed: say so honestly. Null coordinates make the map skip this hop.
            item.update({"country": "Unknown", "countryCode": "UN", "city": "Unknown",
                         "isp": "Unknown", "asn": "Unknown", "latitude": None,
                         "longitude": None, "riskLevel": "LOW", "isSuspicious": False})
        path.append(item)
    return path


if __name__ == "__main__":
    import sys
    from engine.parse import parse_email_bytes
    with open(sys.argv[1], "rb") as f:
        parsed = parse_email_bytes(f.read())
    print(json.dumps(build_path(parsed["hops"]), indent=2))