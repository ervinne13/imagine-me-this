import cv2
import os

def upscale_and_resize_face(input_path, output_path, size=512):
    """
    Reads the cropped face image, resizes it to 512x512 (with upscaling if needed), and saves it.
    """
    img = cv2.imread(input_path)
    if img is None:
        raise FileNotFoundError(f"Image not found: {input_path}")
    # Resize to 512x512 using cubic interpolation for upscaling
    upscaled = cv2.resize(img, (size, size), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(output_path, upscaled)
    return output_path
