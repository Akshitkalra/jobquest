FROM python:3.11-slim
WORKDIR /app

# Install system deps for sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app app

# Pre-download the sentence-transformer model at build time so startup is fast
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
