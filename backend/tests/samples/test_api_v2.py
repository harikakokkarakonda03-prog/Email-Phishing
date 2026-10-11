import requests

BASE = "http://127.0.0.1:8000"
creds = {"email": "test@example.com", "password": "mypassword123"}

# Without a login the API must refuse
print("no token:", requests.get(BASE + "/api/investigations").status_code)  # expect 401

token = requests.post(BASE + "/login", json=creds).json()["token"]
headers = {"Authorization": "Bearer " + token}

for name in ["test1.eml", "safe.eml", "gmail_like.eml", "bec.eml"]:
    with open("tests/samples/" + name, encoding="utf-8") as f:
        r = requests.post(BASE + "/api/analyze", json={"raw": f.read(), "fileName": name}, headers=headers)
    d = r.json()
    print(name, "->", r.status_code, d["id"], d["threatScore"], d["classification"])

print("saved reports:", len(requests.get(BASE + "/api/investigations", headers=headers).json()))
print("stats:", requests.get(BASE + "/api/stats", headers=headers).json()["metrics"])