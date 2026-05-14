FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
 && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./

RUN pip install --no-cache-dir \
    fastapi "uvicorn[standard]" sqlalchemy "psycopg[binary]" pgvector \
    alembic pydantic pydantic-settings email-validator \
    "python-jose[cryptography]" "passlib[bcrypt]" \
    sentence-transformers numpy python-multipart

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
