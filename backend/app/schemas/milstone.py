from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.milestone import MilestoneStatus


class MilestoneCreateRequest(BaseModel):
	name: str = Field(min_length=2, max_length=255)
	description: str | None = Field(default=None, max_length=5000)
	planned_date: date
	actual_date: date | None = None
	progress_percentage: int = Field(default=0, ge=0, le=100)
	status: MilestoneStatus = MilestoneStatus.NOT_STARTED


class MilestoneUpdateRequest(BaseModel):
	name: str | None = Field(default=None, min_length=2, max_length=255)
	description: str | None = Field(default=None, max_length=5000)
	planned_date: date | None = None
	actual_date: date | None = None
	progress_percentage: int | None = Field(default=None, ge=0, le=100)
	status: MilestoneStatus | None = None


class MilestoneResponse(BaseModel):
	id: int
	project_id: int
	name: str
	description: str | None
	planned_date: date
	actual_date: date | None
	progress_percentage: int
	status: MilestoneStatus
	created_at: datetime
	updated_at: datetime


class MilestoneListResponse(BaseModel):
	data: list[MilestoneResponse]
