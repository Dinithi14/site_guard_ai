from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine

from app.models.user import User
from app.models.role import Role, RoleName
from app.models.project import Project
from app.models.milestone import Milestone
from app.models.prediction import Prediction
from app.models.alert import Alert

from app.routers import auth, role, user, projects, milstones, predictions, alert


app = FastAPI(
    title=settings.APP_NAME
)


# Automatically create database tables
Base.metadata.create_all(bind=engine)


def seed_default_roles():
    db: Session = SessionLocal()
    try:
        existing_roles = {
            role.name for role in db.query(Role).all()
        }

        for role_name in (RoleName.ADMIN, RoleName.USER):
            if role_name not in existing_roles:
                db.add(Role(name=role_name))

        db.commit()
    finally:
        db.close()


seed_default_roles()


print("🚀 Swagger Docs: http://127.0.0.1:8000/docs")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


app.include_router(
    role.router,
    prefix="/api/v1",
       tags=["Roles"]
)


app.include_router(
    user.router,
    prefix="/api/v1/users",
    tags=["Users"]
)


app.include_router(
    projects.router,
    prefix="/api/v1/projects",
    tags=["Projects"]
)


app.include_router(
    milstones.router,
    prefix="/api/v1",
    tags=["Milestones"]
)


app.include_router(
    predictions.router,
    prefix="/api/v1",
    tags=["Predictions"]
)


app.include_router(
    alert.router,
    prefix="/api/v1",
    tags=["Alerts"]
)


@app.get("/")
def root():
    return {
        "status": "SiteGuard AI backend running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }