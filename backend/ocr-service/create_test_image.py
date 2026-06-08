from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Create a test image with text
img = Image.new('RGB', (400, 200), color='white')
d = ImageDraw.Draw(img)

# Add text to the image
text = "Safety Observation Report\nUnit: Plant A\nDepartment: Safety\nDate: 2026-05-31"
d.text((10, 10), text, fill='black')

# Save the image
test_image_path = Path(r"c:\Users\ASHUTOSH SAHU\OneDrive\Desktop\Jinsafe-App-UI\backend\ocr-service\test_image.png")
img.save(test_image_path)
print(f"Test image created: {test_image_path}")
