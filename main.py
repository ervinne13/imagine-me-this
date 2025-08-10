import os
from fastapi import FastAPI, Request, UploadFile, File
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
async def use_face(request: Request, file: UploadFile = File(...)):
    # Validate file size (max 5MB) using Content-Length header
    max_size = 5 * 1024 * 1024  # 5MB
    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > max_size:
                return JSONResponse(
                    content={"message": "File too large. Max 5MB allowed."}, status_code=413
                )
        except ValueError:
            # If Content-Length is not an integer, treat as invalid
            return JSONResponse(
                content={"message": "Invalid Content-Length header."}, status_code=400
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
