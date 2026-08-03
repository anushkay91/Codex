# AgentKart AI

AgentKart AI is an auditable, multi-agent back-office assistant for Indian MSMEs. It accepts business documents and natural-language work, delegates bounded tasks through LangGraph specialist agents, and records every tool action in an activity timeline.

## Local development

Run the API from `apps/api`: create a Python 3.12 virtual environment, install `pip install -e '.[dev]'`, copy `.env.example` to `.env`, run `python -m alembic upgrade head`, then start `uvicorn app.main:app --reload`.

Run the web app from `apps/web`: `pnpm install` then `pnpm dev`. Set `VITE_API_URL=http://localhost:8000/api/v1` when necessary.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md). The API is a modular FastAPI application with SQLAlchemy/Alembic, JWT/RBAC, upload validation, deterministic financial services, and a LangGraph supervisor that delegates to invoice, inventory, payments, GST, and business-intelligence nodes.

## Deployment

The container and GitHub Actions CI workflow are under `infra/docker` and `.github/workflows`. Deployment guidance is in `infra/gcp/cloudrun.md`.
