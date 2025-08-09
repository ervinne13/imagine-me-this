import os
from datetime import datetime

def save_upload_file(upload_folder, upload_file, timestamp):
    base_name = os.path.basename(upload_file.filename)
    safe_name = f"{timestamp}-{base_name}"
    file_path = os.path.join(upload_folder, safe_name)
    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())
    return file_path, safe_name
