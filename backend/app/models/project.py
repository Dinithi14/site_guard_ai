from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProjectStatus(str, Enum):
	PLANNED = "PLANNED"
	IN_PROGRESS = "IN_PROGRESS"
	ON_HOLD = "ON_HOLD"
	COMPLETED = "COMPLETED"
	CANCELLED = "CANCELLED"


class Project(Base):
	__tablename__ = "projects"

	id: Mapped[int] = mapped_column(
		primary_key=True,
		index=True
	)

	name: Mapped[str] = mapped_column(
		String(255),
		nullable=False,
		index=True
	)

	description: Mapped[str | None] = mapped_column(
		Text,
		nullable=True
	)

	project_type: Mapped[str] = mapped_column(
		String(100),
		nullable=False
	)

	location: Mapped[str] = mapped_column(
		String(255),
		nullable=False
	)

	client_name: Mapped[str | None] = mapped_column(
		String(255),
		nullable=True
	)

	budget: Mapped[Decimal] = mapped_column(
		Numeric(18, 2),
		nullable=False
	)

	start_date: Mapped[date] = mapped_column(
		Date,
		nullable=False
	)

	expected_end_date: Mapped[date] = mapped_column(
		Date,
		nullable=False
	)

	status: Mapped[ProjectStatus] = mapped_column(
		SQLEnum(ProjectStatus),
		default=ProjectStatus.PLANNED,
		nullable=False
	)

	created_by: Mapped[int] = mapped_column(
		ForeignKey("users.id"),
		nullable=False,
		index=True
	)

	created_at: Mapped[datetime] = mapped_column(
		DateTime,
		default=datetime.utcnow,
		nullable=False
	)

	updated_at: Mapped[datetime] = mapped_column(
		DateTime,
		default=datetime.utcnow,
		onupdate=datetime.utcnow,
		nullable=False
	)

	creator = relationship("User")
