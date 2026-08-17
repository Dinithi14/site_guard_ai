from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ml.predictor import run_prediction
from app.models.prediction import Prediction
from app.models.project import Project
from app.schemas.prediction import PredictionRequest
from app.services.alert_service import create_high_risk_alert


HIGH_RISK_THRESHOLD = 65.0


def _get_project_or_404(
    project_id: int,
    db: Session
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


def run_project_prediction(
    project_id: int,
    data: PredictionRequest,
    db: Session
):
    _get_project_or_404(project_id, db)

    result = run_prediction(data.model_dump())
    risk_score = round(result["delay_probability"] * 100, 2)

    prediction = Prediction(
        project_id=project_id,
        risk_score=risk_score,
        risk_level=result["risk_level"].upper(),
        estimated_delay_days=result["estimated_delay_days"],
        model_version="xgb-v1",
        input_snapshot=data.model_dump(),
    )

    db.add(prediction)

    if risk_score >= HIGH_RISK_THRESHOLD:
        create_high_risk_alert(project_id=project_id, risk_score=risk_score, db=db)

    db.commit()
    db.refresh(prediction)

    return prediction


def list_project_predictions(
    project_id: int,
    db: Session
):
    _get_project_or_404(project_id, db)

    predictions = (
        db.query(Prediction)
        .filter(Prediction.project_id == project_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return {"data": predictions}


def get_prediction_by_id(
    prediction_id: int,
    db: Session
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )

    return prediction
