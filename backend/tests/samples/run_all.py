import glob
import requests

BASE = "http://127.0.0.1:8000"
creds = {"email": "test@example.com", "password": "mypassword123"}

# Log in first, because /scan needs a token
token = requests.post(BASE + "/login", json=creds).json()["token"]
headers = {"Authorization": "Bearer " + token}

for path in sorted(glob.glob("tests/samples/*.eml")):
    with open(path, "rb") as f:
        resp = requests.post(BASE + "/scan", data=f.read(), headers=headers)
    if resp.status_code != 200:
        # Shows the real error from the server instead of crashing
        print(path, "-> ERROR", resp.status_code, resp.text)
        continue
    r = resp.json()
    print(path, "->", r["danger_percent"], "%", r["verdict"])