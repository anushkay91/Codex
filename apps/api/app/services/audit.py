from sqlalchemy.orm import Session

from app.models import AuditLog


def record_audit(
    db: Session, *, organization_id: str, actor_id: str, action: str, entity_type: str, entity_id: str, payload: dict | None = None
) -> None:
    db.add(AuditLog(organization_id=organization_id, actor_id=actor_id, action=action, entity_type=entity_type, entity_id=entity_id, payload=payload or {}))
