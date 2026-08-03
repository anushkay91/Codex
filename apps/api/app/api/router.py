from fastapi import APIRouter

from app.api.routes import agents, auth, business, documents, health

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(business.router)
api_router.include_router(documents.router)
api_router.include_router(agents.router)
