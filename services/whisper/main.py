"""
Whisper transcription API for AI Interview Prep.
Run: uvicorn main:app --host 0.0.0.0 --port 8000
"""
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import whisper

app = FastAPI(title="Whisper Transcription API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup (small = base, medium = medium, etc.)
MODEL_NAME = os.environ.get("WHISPER_MODEL", "base")
model = None

@app.on_event("startup")
async def load_model():
    global model
    model = whisper.load_model(MODEL_NAME)

@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_NAME}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith(("audio/", "video/")):
        raise HTTPException(400, "File must be audio or video")
    suffix = Path(file.filename or "audio").suffix or ".webm"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        result = model.transcribe(tmp_path, fp16=False, language="en")
        transcript = (result.get("text") or "").strip()
        return {"transcript": transcript}
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
