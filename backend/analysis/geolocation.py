import requests

def locate_ip(ip):
    if not ip:
        return None
    try:
        r = requests.get(
            f"http://ip-api.com/json/{ip}?fields=status,country,regionName,city,isp,lat,lon",
            timeout=5,
        ).json()
        if r.get("status") != "success":
            return None
        return {
            "country": r["country"],
            "region": r["regionName"],
            "city": r["city"],
            "isp": r["isp"],
            "latitude": r["lat"],
            "longitude": r["lon"],
        }
    except Exception:
        return None

if __name__ == "__main__":
    import sys
    print(locate_ip(sys.argv[1]))