from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_admin
from app.models.user import User
from app.schemas.project import (
	ProjectCreateRequest,
	ProjectListResponse,
	ProjectResponse,
	ProjectUpdateRequest,
)
from app.services.project_service import (
	create_project,
	delete_project,
	get_project_by_id,
	list_projects,
	update_project,
)


router = APIRouter()


@router.post(
	"/",
	response_model=ProjectResponse,
	summary="Create Project",
	description="Create a new project. ADMIN only.",
	operation_id="projects_create"
)
def create(
	data: ProjectCreateRequest,
	db: Session = Depends(get_db),
	current_user: User = Depends(require_admin)
):
	return create_project(data, created_by=current_user.id, db=db)


@router.get(
	"/",
	response_model=ProjectListResponse,
	summary="List Projects",
	description="List available projects for authenticated users.",
	operation_id="projects_list"
)
def list_all(
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_active_user)
):
	return list_projects(db)


@router.get(
	"/{project_id}",
	response_model=ProjectResponse,
	summary="Get Project",
	description="Get one project by id.",
	operation_id="projects_get_by_id"
)
def get_by_id(
	project_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_active_user)
):
	return get_project_by_id(project_id, db)


@router.patch(
	"/{project_id}",
	response_model=ProjectResponse,
	summary="Update Project",
	description="Update project details. ADMIN only.",
	operation_id="projects_update"
)
def update(
	project_id: int,
	data: ProjectUpdateRequest,
	db: Session = Depends(get_db),
	current_user: User = Depends(require_admin)
):
	return update_project(project_id, data, db)


@router.delete(
	"/{project_id}",
	summary="Delete Project",
	description="Delete project by id. ADMIN only.",
	operation_id="projects_delete"
)
def delete(
	project_id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(require_admin)
):
	return delete_project(project_id, db)
