from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    MeResponse,
    LogoutResponse,
)

from app.services.auth_service import (
    register_user,
    login_user,
    get_me,
    logout_user,
)


router = APIRouter()


@router.post(
    "/register",
    response_model=MeResponse,
    summary="Register User",
    description="Create a new user account. First registered user becomes ADMIN.",
    operation_id="auth_register_user"
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(data, db)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login User",
    description="Authenticate user credentials and return JWT access token.",
    operation_id="auth_login_user"
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    return login_user(data, db)


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get Current User",
    description="Return currently authenticated user profile.",
    operation_id="auth_get_current_user"
)
def me(
    current_user: User = Depends(get_current_active_user)
):
    return get_me(current_user)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Logout User",
    description="Stateless logout endpoint. Client should remove stored token.",
    operation_id="auth_logout_user"
)
def logout(
    current_user: User = Depends(get_current_active_user)
):
    return logout_user()