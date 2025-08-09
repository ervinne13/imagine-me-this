import cv2
import os

def upscale_and_resize_face(input_path, output_path, size=512):
    """
    Reads the cropped face image, resizes it to 512x512 (with upscaling if needed), and saves it.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"File does not exist: {input_path}")
    img = cv2.imread(input_path)

    if img is None:
        raise FileNotFoundError(f"Image not found or could not be read as an image: {input_path}")

    upscaled = cv2.resize(img, (size, size), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(output_path, upscaled)
    return output_path
