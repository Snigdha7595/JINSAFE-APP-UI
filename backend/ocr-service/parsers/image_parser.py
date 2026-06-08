import io
import logging
from typing import Dict, Any
from PIL import Image
from utils.ocr_engine import extract_text_from_image_bytes

logger = logging.getLogger(__name__)


class ImageParser:
    """Parser for image files (PNG, JPG, JPEG)"""
    
    async def parse(self, file_content: bytes) -> Dict[str, Any]:
        """Parse image file and extract text using OCR"""
        try:
            logger.info("Starting image parsing")
            image = Image.open(io.BytesIO(file_content))
            image = image.convert("RGB")
            logger.info(f"Image opened: {image.size}, mode: {image.mode}")

            text = extract_text_from_image_bytes(file_content)
            logger.info(f"Text extracted: {len(text)} characters, preview: {text[:100]}")
            
            import base64
            image_base64 = base64.b64encode(file_content).decode('utf-8')

            result = {
                "text": text,
                "image_base64": image_base64,
                "page_count": 1,
                "format": "image",
                "image_size": image.size,
                "image_mode": image.mode
            }
            logger.info(f"Parse result: {result}")
            return result
        except Exception as e:
            logger.error(f"Image parsing failed: {str(e)}", exc_info=True)
            raise
