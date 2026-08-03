from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import OrganizationMember, User

bearer = HTTPBearer(auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]


class CurrentContext:
    def __init__(self, user: User, membership: OrganizationMember) -> None:
        self.user = user
        self.organization_id = membership.organization_id
        self.role = membership.role


def get_current_context(
    db: DbSession, credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]
) -> CurrentContext:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    user_id = decode_access_token(credentials.credentials)
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is unavailable")
    membership = db.scalar(select(OrganizationMember).where(OrganizationMember.user_id == user.id))
    if membership is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization membership required")
    return CurrentContext(user, membership)


CurrentUser = Annotated[CurrentContext, Depends(get_current_context)]


def require_manager(context: CurrentUser) -> CurrentContext:
    if context.role not in {"owner", "manager"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager permission required")
    return context


ManagerUser = Annotated[CurrentContext, Depends(require_manager)]
