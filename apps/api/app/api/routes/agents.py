from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.agents.orchestrator import execute_run
from app.api.deps import CurrentUser, DbSession, ManagerUser
from app.models import AgentRun, Document
from app.schemas.agents import AgentRunCreate, AgentRunResponse

router = APIRouter(prefix="/agent-runs", tags=["agents"])


@router.post("", response_model=AgentRunResponse, status_code=status.HTTP_201_CREATED)
def start_agent_run(payload: AgentRunCreate, context: ManagerUser, db: DbSession) -> AgentRun:
    if payload.document_id:
        document = db.scalar(select(Document).where(Document.id == payload.document_id, Document.organization_id == context.organization_id))
        if document is None:
            raise HTTPException(status_code=404, detail="Document not found")
    run = AgentRun(organization_id=context.organization_id, task=payload.task)
    db.add(run)
    db.flush()
    try:
        execute_run(db, run, organization_id=context.organization_id, task=payload.task, document_id=payload.document_id)
        db.commit()
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail="The agent workflow could not be completed") from error
    db.refresh(run)
    return run


@router.get("/{run_id}", response_model=AgentRunResponse)
def get_agent_run(run_id: str, context: CurrentUser, db: DbSession) -> AgentRun:
    run = db.scalar(select(AgentRun).where(AgentRun.id == run_id, AgentRun.organization_id == context.organization_id))
    if run is None:
        raise HTTPException(status_code=404, detail="Agent run not found")
    return run
