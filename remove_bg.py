from rembg import remove
from PIL import Image
import os

input_path = "frontend/public/123.png"
output_path = "frontend/public/123_nobg.png"

try:
    print(f"Reading image from {input_path}...")
    input_image = Image.open(input_path)
    print("Removing background...")
    output_image = remove(input_image)
    print(f"Saving image to {output_path}...")
    output_image.save(output_path)
    print("Background removed successfully!")
except Exception as e:
    print(f"Error removing background: {e}")
