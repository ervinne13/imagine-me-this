import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.face_processing.face_processor import process_face_upload
from datetime import datetime

load_dotenv()

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.post("/api/v1/use-face")
async def use_face(file: UploadFile = File(...)):
    # Validate file size (max 5MB)
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > 5 * 1024 * 1024:
        return JSONResponse(content={"message": "File too large. Max 5MB allowed."}, status_code=413)

    try:
        result = process_face_upload(file)
        return JSONResponse(content={"message": "hello world", **result})
    except ValueError as e:
        return JSONResponse(content={"message": str(e)}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"message": f"Internal server error: {e}"}, status_code=500)
