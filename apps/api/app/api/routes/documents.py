from fastapi import APIRouter, File, UploadFile, status

from app.api.deps import DbSession, ManagerUser
from app.schemas.agents import DocumentResponse
from app.services.documents import store_document

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(context: ManagerUser, db: DbSession, file: UploadFile = File(...)) -> DocumentResponse:
    document = await store_document(db, organization_id=context.organization_id, actor_id=context.user.id, upload=file)
    db.commit()
    db.refresh(document)
    return document
