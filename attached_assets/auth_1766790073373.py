import os, time, uuid, jwt, pyotp
from fastapi import HTTPException, Header, Depends
from passlib.hash import bcrypt
from sqlalchemy.orm import Session
from .db import get_db
from .models import AdminUser

SECRET = os.getenv("JWT_SECRET", "dev-secret")
ALGO = "HS256"

def make_pass_token(sub: str, pass_type: str, scope: list[str], exp_hours=72, max_uses=1):
    now = int(time.time())
    payload = {"sub": sub, "ptype": pass_type, "scope": scope, "exp": now + exp_hours*3600,
               "mu": max_uses, "uc": 0, "jti": str(uuid.uuid4()), "iat": now}
    token = jwt.encode(payload, SECRET, algorithm=ALGO)
    return token, payload

def verify_pass_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except Exception:
        raise HTTPException(401, "invalid_or_expired_token")

async def pass_guard(authorization: str = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "missing_token")
    token = authorization.split(" ", 1)[1]
    return verify_pass_token(token)

def create_admin(db: Session, email: str, password: str):
    hashed = bcrypt.hash(password)
    secret = pyotp.random_base32()
    admin = AdminUser(email=email, password_hash=hashed, totp_secret=secret)
    db.add(admin); db.commit()
    return admin, secret

def admin_login(db: Session, email: str, password: str, totp_code: str):
    admin = db.query(AdminUser).filter_by(email=email).first()
    if not admin or not bcrypt.verify(password, admin.password_hash):
        raise HTTPException(401, "bad_credentials")
    totp = pyotp.TOTP(admin.totp_secret)
    if not totp.verify(totp_code):
        raise HTTPException(401, "bad_totp")
    token, _ = make_pass_token(admin.email, "ADMIN", ["admin"], exp_hours=8, max_uses=1000)
    return token