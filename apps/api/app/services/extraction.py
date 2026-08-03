from __future__ import annotations

import io
from pathlib import Path

import fitz
import pandas as pd
from PIL import Image
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Document


def extract_document_text(db: Session, *, organization_id: str, document_id: str) -> dict:
    document = db.get(Document, document_id)
    if document is None or document.organization_id != organization_id:
        raise ValueError("Document not found")
    path = Path(get_settings().upload_directory) / organization_id / document.storage_key
    if not path.is_file():
        raise ValueError("Document content is unavailable")
    raw = path.read_bytes()
    if document.mime_type == "application/pdf":
        pdf = fitz.open(stream=raw, filetype="pdf")
        text = "\n".join(page.get_text("text") for page in pdf)
        pdf.close()
    elif document.mime_type == "text/csv":
        frame = pd.read_csv(io.BytesIO(raw), nrows=25)
        text = frame.to_csv(index=False)
    else:
        try:
            import pytesseract

            text = pytesseract.image_to_string(Image.open(io.BytesIO(raw)))
        except Exception as error:
            raise ValueError("Image OCR is unavailable; install Tesseract on the API host") from error
    document.status = "extracted"
    return {"document_id": document.id, "text": text[:12_000], "characters": len(text)}
