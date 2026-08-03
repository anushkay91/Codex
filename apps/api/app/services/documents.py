import hashlib
import re
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Document
from app.services.audit import record_audit

ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png", "text/csv"}
SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


async def store_document(db: Session, *, organization_id: str, actor_id: str, upload: UploadFile) -> Document:
    settings = get_settings()
    if upload.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only PDF, PNG, JPEG, and CSV files are supported")
    raw = await upload.read(settings.max_upload_bytes + 1)
    if not raw:
        raise HTTPException(status_code=422, detail="The uploaded file is empty")
    if len(raw) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="The uploaded file exceeds the 10 MB limit")
    filename = SAFE_NAME.sub("_", Path(upload.filename or "upload").name)[:200]
    extension = Path(filename).suffix.lower()
    if extension not in {".pdf", ".png", ".jpg", ".jpeg", ".csv"}:
        raise HTTPException(status_code=422, detail="File extension is not permitted")
    storage_dir = Path(settings.upload_directory) / organization_id
    storage_dir.mkdir(parents=True, exist_ok=True)
    storage_key = f"{uuid4()}{extension}"
    (storage_dir / storage_key).write_bytes(raw)
    document = Document(organization_id=organization_id, original_filename=filename, storage_key=storage_key, content_hash=hashlib.sha256(raw).hexdigest(), mime_type=upload.content_type, size_bytes=len(raw))
    db.add(document)
    db.flush()
    record_audit(db, organization_id=organization_id, actor_id=actor_id, action="document.uploaded", entity_type="document", entity_id=document.id)
    return document
