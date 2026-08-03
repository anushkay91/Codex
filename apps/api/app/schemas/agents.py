from pydantic import BaseModel, Field


class AgentRunCreate(BaseModel):
    task: str = Field(min_length=3, max_length=1_000)
    document_id: str | None = None


class AgentRunResponse(BaseModel):
    id: str
    status: str
    current_node: str | None
    summary: str | None

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: str
    original_filename: str
    mime_type: str
    size_bytes: int
    status: str

    model_config = {"from_attributes": True}
