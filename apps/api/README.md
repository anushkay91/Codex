# AgentKart API

## Run locally

1. Create a virtual environment with Python 3.12+.
2. Install the package: `pip install -e .`
3. Copy `.env.example` to `.env` and replace the JWT secret.
4. Apply the schema: `alembic upgrade head`.
5. Start the server: `uvicorn app.main:app --reload`.

Interactive API documentation is available at `http://localhost:8000/docs`.

Development uses SQLite. Production must set a non-default `AGENTKART_JWT_SECRET_KEY` and use a managed relational database before allowing more than one Cloud Run instance.
