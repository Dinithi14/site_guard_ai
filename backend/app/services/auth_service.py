from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.role import RoleName
from app.models.user import User
from app.models.role import Role

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest
)

from app.core.secuirity import (
    hash_password,
    verify_password,
    create_access_token
)


def _serialize_user(user: User) -> dict:
    role_value = RoleName.USER
    if user.role and user.role.name:
        role_value = user.role.name

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": role_value,
        "is_verified": user.is_verified,
        "is_blocked": user.is_blocked,
        "is_active": user.is_active,
    }


def register_user(
    data: RegisterRequest,
    db: Session
):
    # 1. Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # 2. Get user count
    user_count = db.query(User).count()

    # 3. Select role
    if user_count == 0:
        role_name = "ADMIN"
    else:
        role_name = "USER"

    user_role = (
        db.query(Role)
        .filter(Role.name == role_name)
        .first()
    )

    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{role_name} role not found"
        )

    # 4. Hash password
    password_hash = hash_password(data.password)

    # 5. Create user
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=password_hash,

        # SQLAlchemy relationship
        role=user_role,

        is_verified=True,
        is_blocked=False,
        is_active=True,
    )

    # 6. Save user
    db.add(user)
    db.commit()
    db.refresh(user)

    return _serialize_user(user)




def login_user(
    data: LoginRequest,
    db: Session
):
    # 1. Find user
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 2. Verify password
    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3. Check blocked
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is blocked"
        )

    # 4. Check active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # 5. Get role
    role_name = user.role.name if user.role else None

    # 6. Create JWT
    access_token = create_access_token(
        user_id=user.id,
        role=role_name
    )

    # 7. Return token
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


def get_me(
    current_user: User
):
    return _serialize_user(current_user)


def logout_user():
    # Stateless JWT logout. Client must remove token.
    return {
        "message": "Logged out successfully"
    }