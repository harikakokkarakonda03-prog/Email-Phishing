import requests

BASE = "http://127.0.0.1:8000"
creds = {"email": "test@example.com", "password": "mypassword123"}

# Without a token the API must refuse
print("no token:", requests.get(BASE + "/scans").status_code)  # expect 401

token = requests.post(BASE + "/login", json=creds).json()["token"]
headers = {"Authorization": "Bearer " + token}

with open("tests/samples/test1.eml", "rb") as f:
    print("scan:", requests.post(BASE + "/scan", data=f.read(), headers=headers).json()["verdict"])

print("my scans:", requests.get(BASE + "/scans", headers=headers).json())