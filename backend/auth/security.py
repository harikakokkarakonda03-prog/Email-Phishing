import os
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
import jwt

# Secret used to sign tokens. Set a real one as an environment variable before deploying.
SECRET_KEY = os.environ.get("SECRET_KEY", "change-this-before-deploying")

def hash_password(password):
    # A random salt makes two users with the same password get different hashes
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return salt + "$" + h  # stored in the database, never the real password

def verify_password(password, stored):
    salt, h = stored.split("$")
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    # compare_digest is a safe comparison that resists timing attacks
    return hmac.compare_digest(h, check)

def create_token(user_id):
    # The token proves who the user is and expires after 7 days
    exp = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    # Returns the user id if the token is valid, otherwise None
    try:
        return int(jwt.decode(token, SECRET_KEY, algorithms=["HS256"])["sub"])
    except Exception:
        return None