import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.router import api_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 - imports all model metadata before local bootstrap

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", openapi_url="/api/v1/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"]
)

# Include api routes
app.include_router(api_router)

# Mount frontend static files if present
static_dir = "/app/static" if os.path.exists("/app/static") else "./static"

if os.path.isdir(static_dir):
    # Mount assets folder
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html on root and handle SPA route fallbacks
    @app.get("/{fallback_path:path}")
    def serve_frontend(fallback_path: str):
        # Do not catch API or openapi docs
        if (
            fallback_path.startswith("api/") or 
            fallback_path.startswith("docs") or 
            fallback_path.startswith("openapi.json")
        ):
            raise HTTPException(status_code=404, detail="Not Found")
            
        index_file = os.path.join(static_dir, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Static assets missing")


@app.on_event("startup")
def local_sqlite_bootstrap() -> None:
    """Development convenience only; deployed environments run Alembic migrations explicitly."""
    if settings.environment == "development" and settings.database_url.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
