"""
Pure prediction logic: turns validated request data into a risk
prediction using the loaded XGBoost classifier + regressor.
"""
import pandas as pd
from fastapi import HTTPException
from app.core.config import settings
from app.ml.model_loader import clf, reg, encoders, MODEL_LOADED


def run_prediction(input_dict: dict) -> dict:
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not trained yet. Run train_model.py first.")

    row = {}
    for col in settings.CATEGORICAL_COLS:
        le = encoders[col]
        value = input_dict[col]
        if value not in le.classes_:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown value '{value}' for '{col}'. Expected one of: {list(le.classes_)}",
            )
        row[col] = le.transform([value])[0]
    for col in settings.NUMERIC_COLS:
        row[col] = input_dict[col]

    X = pd.DataFrame([row])[settings.FEATURE_COLS]

    delay_probability = float(clf.predict_proba(X)[0][1])
    is_delayed_pred = int(clf.predict(X)[0])

    if delay_probability < 0.35:
        risk_level = "Low"
    elif delay_probability < 0.65:
        risk_level = "Medium"
    else:
        risk_level = "High"

    estimated_delay_days = None
    if is_delayed_pred == 1:
        estimated_delay_days = round(float(reg.predict(X)[0]), 0)

    return {
        "risk_level": risk_level,
        "delay_probability": round(delay_probability, 3),
        "no_delay_probability": round(1 - delay_probability, 3),
        "estimated_delay_days": estimated_delay_days,
    }
