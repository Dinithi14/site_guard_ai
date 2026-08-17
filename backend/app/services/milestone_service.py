from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.milestone import Milestone
from app.models.project import Project
from app.schemas.milstone import MilestoneCreateRequest, MilestoneUpdateRequest


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


def create_milestone(
	project_id: int,
	data: MilestoneCreateRequest,
	db: Session
):
	_get_project_or_404(project_id, db)

	milestone = Milestone(
		project_id=project_id,
		name=data.name,
		description=data.description,
		planned_date=data.planned_date,
		actual_date=data.actual_date,
		progress_percentage=data.progress_percentage,
		status=data.status,
	)

	db.add(milestone)
	db.commit()
	db.refresh(milestone)

	return milestone


def list_project_milestones(
	project_id: int,
	db: Session
):
	_get_project_or_404(project_id, db)

	milestones = (
		db.query(Milestone)
		.filter(Milestone.project_id == project_id)
		.order_by(Milestone.planned_date.asc(), Milestone.id.asc())
		.all()
	)

	return {"data": milestones}


def get_milestone_by_id(
	milestone_id: int,
	db: Session
):
	milestone = (
		db.query(Milestone)
		.filter(Milestone.id == milestone_id)
		.first()
	)

	if not milestone:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Milestone not found"
		)

	return milestone


def update_milestone(
	milestone_id: int,
	data: MilestoneUpdateRequest,
	db: Session
):
	milestone = get_milestone_by_id(milestone_id, db)

	if data.name is not None:
		milestone.name = data.name
	if data.description is not None:
		milestone.description = data.description
	if data.planned_date is not None:
		milestone.planned_date = data.planned_date
	if data.actual_date is not None:
		milestone.actual_date = data.actual_date
	if data.progress_percentage is not None:
		milestone.progress_percentage = data.progress_percentage
	if data.status is not None:
		milestone.status = data.status

	db.commit()
	db.refresh(milestone)

	return milestone


def delete_milestone(
	milestone_id: int,
	db: Session
):
	milestone = get_milestone_by_id(milestone_id, db)

	db.delete(milestone)
	db.commit()

	return {"message": "Milestone deleted successfully"}
