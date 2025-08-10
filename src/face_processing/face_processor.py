import os
from datetime import datetime
from src.face_processing.face_cropper import crop_face
from src.face_processing.face_upload import save_upload_file
from src.face_processing.face_upscaler import upscale_and_resize_face

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")

def process_face_upload(file):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    file_location, safe_name = save_upload_file(UPLOAD_FOLDER, file, timestamp)

    # Get extension for cropping
    _, ext = os.path.splitext(safe_name)
    cropped_name = crop_face(file_location, UPLOAD_FOLDER, timestamp, ext or '.png')
    if not cropped_name:
        raise ValueError("No face detected.")

    # Upscale the cropped face to 512x512
    cropped_path = os.path.join(UPLOAD_FOLDER, cropped_name)
    upscaled_name = f"{timestamp}-upscaled{ext or '.png'}"
    upscaled_path = os.path.join(UPLOAD_FOLDER, upscaled_name)
    upscale_and_resize_face(cropped_path, upscaled_path, size=512)

    return {"cropped": cropped_name, "upscaled": upscaled_name}
