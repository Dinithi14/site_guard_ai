from datetime import datetime, timedelta, timezone

from fastapi.security import HTTPBearer
from jose import jwt
from pwdlib import PasswordHash

from app.core.config import settings


# Password hashing
password_hash = PasswordHash.recommended()


# Simple HTTP Bearer token for Swagger Authorize.
# This asks only for JWT token and sends Authorization: Bearer <token>.
bearer_scheme = HTTPBearer()


# Hash password
def hash_password(password: str) -> str:
    return password_hash.hash(password)


# Verify password
def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        password,
        hashed_password
    )


# Create JWT access token
def create_access_token(
    user_id: int,
    role: str | None
) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
    }

    access_token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return access_token