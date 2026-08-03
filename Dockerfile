FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080
WORKDIR /app
COPY apps/api/pyproject.toml ./
COPY apps/api/app ./app
RUN pip install --no-cache-dir .
COPY apps/web/dist ./static
RUN useradd --create-home agentkart && chown -R agentkart:agentkart /app
USER agentkart
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
