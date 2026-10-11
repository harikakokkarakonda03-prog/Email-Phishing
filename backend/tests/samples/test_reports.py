import requests

BASE = "http://127.0.0.1:8000"
creds = {"email": "test@example.com", "password": "mypassword123"}

token = requests.post(BASE + "/login", json=creds).json()["token"]
headers = {"Authorization": "Bearer " + token}
sid = requests.get(BASE + "/scans", headers=headers).json()[0]["id"]

print("no token:", requests.get(f"{BASE}/reports/{sid}").status_code)  # expect 401
print("with token:", requests.get(f"{BASE}/reports/{sid}?token={token}").status_code)  # expect 200
print("Open this in your browser:")
print(f"{BASE}/reports/{sid}?token={token}")