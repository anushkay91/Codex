# Cloud Run deployment

Build and push the container from the repository root, then deploy it with a dedicated service account. Set `AGENTKART_JWT_SECRET_KEY` and `OPENAI_API_KEY` through Secret Manager; do not set them in source or CI logs.

For production, use Cloud SQL PostgreSQL when concurrent writes or more than one Cloud Run instance are required. Cloud Storage should hold uploaded source documents and generated exports.
