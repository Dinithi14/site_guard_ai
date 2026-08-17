from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreateRequest, ProjectUpdateRequest


def _validate_project_dates(start_date, expected_end_date):
	if expected_end_date < start_date:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="expected_end_date must be greater than or equal to start_date"
		)


def create_project(
	data: ProjectCreateRequest,
	created_by: int,
	db: Session
):
	_validate_project_dates(data.start_date, data.expected_end_date)

	project = Project(
		name=data.name,
		description=data.description,
		project_type=data.project_type,
		location=data.location,
		client_name=data.client_name,
		budget=data.budget,
		start_date=data.start_date,
		expected_end_date=data.expected_end_date,
		status=data.status,
		created_by=created_by,
	)

	db.add(project)
	db.commit()
	db.refresh(project)

	return project


def list_projects(db: Session):
	projects = (
		db.query(Project)
		.order_by(Project.created_at.desc())
		.all()
	)

	return {"data": projects}


def get_project_by_id(
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


def update_project(
	project_id: int,
	data: ProjectUpdateRequest,
	db: Session
):
	project = get_project_by_id(project_id, db)

	next_start_date = data.start_date if data.start_date is not None else project.start_date
	next_end_date = data.expected_end_date if data.expected_end_date is not None else project.expected_end_date
	_validate_project_dates(next_start_date, next_end_date)

	if data.name is not None:
		project.name = data.name
	if data.description is not None:
		project.description = data.description
	if data.project_type is not None:
		project.project_type = data.project_type
	if data.location is not None:
		project.location = data.location
	if data.client_name is not None:
		project.client_name = data.client_name
	if data.budget is not None:
		project.budget = data.budget
	if data.start_date is not None:
		project.start_date = data.start_date
	if data.expected_end_date is not None:
		project.expected_end_date = data.expected_end_date
	if data.status is not None:
		project.status = data.status

	db.commit()
	db.refresh(project)

	return project


def delete_project(
	project_id: int,
	db: Session
):
	project = get_project_by_id(project_id, db)

	db.delete(project)
	db.commit()

	return {"message": "Project deleted successfully"}
