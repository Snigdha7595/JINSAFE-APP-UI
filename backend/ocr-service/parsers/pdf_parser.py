import io
from pdf2image import convert_from_bytes
import logging
from typing import Dict, Any
from utils.ocr_engine import extract_text_from_image_bytes

logger = logging.getLogger(__name__)

class PDFParser:
    """Parser for PDF files"""
    
    async def parse(self, file_content: bytes) -> Dict[str, Any]:
        """Parse PDF file and extract text"""
        try:
            images = convert_from_bytes(file_content)
            
            extracted_text = ""
            for page_num, image in enumerate(images):
                page_bytes = io.BytesIO()
                image.save(page_bytes, format="PNG")
                page_bytes.seek(0)
                text = extract_text_from_image_bytes(page_bytes.read())
                extracted_text += f"\n--- Page {page_num + 1} ---\n{text}"
            
            return {
                "text": extracted_text,
                "page_count": len(images),
                "format": "pdf"
            }
        except Exception as e:
            logger.error(f"PDF parsing failed: {str(e)}", exc_info=True)
            raise
