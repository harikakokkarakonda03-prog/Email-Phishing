import requests

with open("tests/samples/test1.eml", "rb") as f:
    r = requests.post("http://127.0.0.1:8000/scan", data=f.read())

print(r.json())