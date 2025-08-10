import os
import re

def save_upload_file(upload_folder, upload_file, timestamp):
    base_name = sanitize_filename(upload_file.filename)
    safe_name = f"{timestamp}-{base_name}"
    file_path = os.path.join(upload_folder, safe_name)
    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())
    return file_path, safe_name

def sanitize_filename(filename):
    # Prevent directory traversal
    filename = os.path.basename(filename)
    if '.' in filename:
        name, ext = filename.rsplit('.', 1)
        name = re.sub(r'[^A-Za-z0-9_-]', '_', name)
        ext = re.sub(r'[^A-Za-z0-9]', '', ext)
        filename = f"{name}.{ext}" if ext else name
    else:
        filename = re.sub(r'[^A-Za-z0-9_-]', '_', filename)
    return filename
