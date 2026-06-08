import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from PIL import Image
import io
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class OCRService:
    """Service for Optical Character Recognition"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def extract_text_from_image(self, image_bytes: bytes) -> str:
        """Extract text from image using Tesseract OCR"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            self.logger.error(f"OCR extraction failed: {str(e)}")
            raise
    
    async def extract_observations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract observations and unit details from processed document data"""
        from .observation_generator import ObservationGenerator
        
        generator = ObservationGenerator()
        result = await generator.generate_observations(data)
        return result
    
    async def process_document(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Main method to process any document type"""
        # Routing to appropriate parser
        pass
