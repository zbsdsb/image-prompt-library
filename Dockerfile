FROM node:24-bookworm-slim AS frontend-build

WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json vite.config.ts ./
COPY frontend ./frontend
ARG VITE_APP_VERSION=docker
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
RUN npm run build

FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/home/app \
    IMAGE_PROMPT_LIBRARY_PATH=/data/library \
    IMAGE_PROMPT_LIBRARY_STATE_PATH=/data/state \
    IMAGE_PROMPT_LIBRARY_CONFIG_PATH=/data/state/config.json

WORKDIR /app
COPY pyproject.toml ./
COPY backend ./backend
COPY --from=frontend-build /src/frontend/dist ./frontend/dist

ARG IMAGE_PROMPT_LIBRARY_VERSION=docker
ENV IMAGE_PROMPT_LIBRARY_VERSION=${IMAGE_PROMPT_LIBRARY_VERSION}

RUN pip install --no-cache-dir . \
    && addgroup --system app \
    && adduser --system --ingroup app --home /home/app app \
    && mkdir -p /data/library /data/state \
    && chown -R app:app /app /data /home/app

USER app
EXPOSE 8000
VOLUME ["/data/library", "/data/state"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3)" || exit 1

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
