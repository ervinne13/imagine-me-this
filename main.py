import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.face_processing.face_processor import process_face_upload

load_dotenv()

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Vite: Hardcoded for now
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI()

# Allow CORS for specified origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/use-face")
async def use_face(file: UploadFile = File(...)):
    # Validate file size (max 5MB) without loading entire file into memory
    max_size = 5 * 1024 * 1024  # 5MB
    total = 0
    chunk_size = 1024 * 1024  # 1MB
    file.file.seek(0)
    while True:
        chunk = file.file.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > max_size:
            return JSONResponse(
                content={"message": "File too large. Max 5MB allowed."}, status_code=413
            )
    file.file.seek(0)  # Reset pointer so we don't crash the next calls

    try:
        result = process_face_upload(file)
        return JSONResponse(
            content={"message": "Face processing completed successfully", **result}
        )
    except ValueError as e:
        return JSONResponse(content={"message": str(e)}, status_code=400)
    except Exception as e:
        return JSONResponse(
            content={"message": f"Internal server error: {e}"}, status_code=500
        )
