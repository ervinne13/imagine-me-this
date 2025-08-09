import os
import re
import re

def save_upload_file(upload_folder, upload_file, timestamp):
    base_name = os.path.basename(upload_file.filename)
    base_name = sanitize_filename(upload_file.filename)
    safe_name = f"{timestamp}-{base_name}"
    file_path = os.path.join(upload_folder, safe_name)
    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())
    return file_path, safe_name

def sanitize_filename(filename):
    # Only allow alphanumeric, dash, underscore, and a single dot for extension
    filename = os.path.basename(filename)
    filename = re.sub(r'[^A-Za-z0-9._-]', '_', filename)

    # Prevent multiple dots (e.g. evil..jpg)
    parts = filename.split('.')
    if len(parts) > 2:
        filename = '_'.join(parts[:-1]) + '.' + parts[-1]
    return filename
