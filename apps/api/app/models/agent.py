from sqlalchemy import ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.common import TimestampedModel


class AgentRun(TimestampedModel, Base):
    __tablename__ = "agent_runs"
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    task: Mapped[str] = mapped_column(String(1000))
    status: Mapped[str] = mapped_column(String(32), default="queued")
    current_node: Mapped[str | None] = mapped_column(String(80))
    summary: Mapped[str | None] = mapped_column(String(2000))


class AgentEvent(TimestampedModel, Base):
    __tablename__ = "agent_events"
    run_id: Mapped[str] = mapped_column(ForeignKey("agent_runs.id"), index=True)
    sequence: Mapped[int] = mapped_column(Integer)
    agent: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(32))
    tool: Mapped[str | None] = mapped_column(String(120))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)


class AuditLog(TimestampedModel, Base):
    __tablename__ = "audit_logs"
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    actor_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(120))
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[str] = mapped_column(String(36))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
