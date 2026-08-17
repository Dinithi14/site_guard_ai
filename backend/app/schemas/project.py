from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.project import ProjectStatus


class ProjectCreateRequest(BaseModel):
	name: str = Field(min_length=2, max_length=255)
	description: str | None = Field(default=None, max_length=5000)
	project_type: str = Field(min_length=2, max_length=100)
	location: str = Field(min_length=2, max_length=255)
	client_name: str | None = Field(default=None, max_length=255)
	budget: Decimal = Field(gt=0)
	start_date: date
	expected_end_date: date
	status: ProjectStatus = ProjectStatus.PLANNED


class ProjectUpdateRequest(BaseModel):
	name: str | None = Field(default=None, min_length=2, max_length=255)
	description: str | None = Field(default=None, max_length=5000)
	project_type: str | None = Field(default=None, min_length=2, max_length=100)
	location: str | None = Field(default=None, min_length=2, max_length=255)
	client_name: str | None = Field(default=None, max_length=255)
	budget: Decimal | None = Field(default=None, gt=0)
	start_date: date | None = None
	expected_end_date: date | None = None
	status: ProjectStatus | None = None


class ProjectResponse(BaseModel):
	id: int
	name: str
	description: str | None
	project_type: str
	location: str
	client_name: str | None
	budget: Decimal
	start_date: date
	expected_end_date: date
	status: ProjectStatus
	created_by: int
	created_at: datetime
	updated_at: datetime


class ProjectListResponse(BaseModel):
	data: list[ProjectResponse]
