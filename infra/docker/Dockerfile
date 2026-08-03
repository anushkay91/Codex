FROM node:24-alpine AS web-build
WORKDIR /workspace/apps/web
COPY apps/web/package.json apps/web/pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY apps/web/ ./
RUN pnpm build

FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080
WORKDIR /app
COPY apps/api/pyproject.toml ./
COPY apps/api/app ./app
RUN pip install --no-cache-dir .
COPY --from=web-build /workspace/apps/web/dist ./static
RUN useradd --create-home agentkart
USER agentkart
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
