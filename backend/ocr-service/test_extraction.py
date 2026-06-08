import requests
from pathlib import Path

def test_image_upload():
    # Use one of the existing images
    image_path = Path(r"c:\Users\ASHUTOSH SAHU\OneDrive\Desktop\Jinsafe-App-UI\public\images\content-images\preview-image.png")
    
    if not image_path.exists():
        print(f"Image not found: {image_path}")
        return
    
    print(f"Testing with image: {image_path}")
    print(f"File size: {image_path.stat().st_size} bytes")
    
    url = "http://localhost:8000/api/v1/upload"
    
    with open(image_path, 'rb') as f:
        files = {'file': (image_path.name, f)}
        resp = requests.post(url, files=files)
        print(f"Response status: {resp.status_code}")
        data = resp.json()
        print(f"Response keys: {data.keys()}")
        print(f"Full response: {data}")
        if data.get('extracted_text'):
            print(f"\nExtracted text: {data['extracted_text'][:500]}")
        else:
            print("\nNo text extracted!")

test_image_upload()

