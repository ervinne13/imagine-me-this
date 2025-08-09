import os
import cv2
from dotenv import load_dotenv

load_dotenv()

FACE_CLASSIFIER = os.getenv("FACE_CLASSIFIER")

if not FACE_CLASSIFIER or not os.path.exists(FACE_CLASSIFIER):
    raise FileNotFoundError(f"Face classifier not found at {FACE_CLASSIFIER}")

face_cascade = cv2.CascadeClassifier(FACE_CLASSIFIER)

def crop_face(image_path, output_folder, timestamp, ext='.png'):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        return None  # No face found

    # This thing can detect multiple faces, only get [0]
    x, y, w, h = faces[0]
    face_img = img[y:y+h, x:x+w]
    cropped_name = f"{timestamp}-cropped{ext}"
    cropped_path = os.path.join(output_folder, cropped_name)
    cv2.imwrite(cropped_path, face_img)
    return cropped_name
