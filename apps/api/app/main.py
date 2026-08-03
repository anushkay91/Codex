from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 - imports all model metadata before local bootstrap

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", openapi_url="/api/v1/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type", "X-Request-ID"])
app.include_router(api_router)


@app.on_event("startup")
def local_sqlite_bootstrap() -> None:
    """Development convenience only; deployed environments run Alembic migrations explicitly."""
    if settings.environment == "development" and settings.database_url.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
