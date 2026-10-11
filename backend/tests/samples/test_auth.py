import requests

BASE = "http://127.0.0.1:8000"
creds = {"email": "test@example.com", "password": "mypassword123"}

# Register once. Running it again shows "Email already registered", which is normal
print("register:", requests.post(BASE + "/register", json=creds).json())

# Login should return a token
print("login:", requests.post(BASE + "/login", json=creds).json())