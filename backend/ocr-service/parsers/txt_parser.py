import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class TxtParser:
    """Parser for plain text files"""
    
    async def parse(self, file_content: bytes) -> Dict[str, Any]:
        """Parse text file"""
        try:
            text = file_content.decode("utf-8")
            
            return {
                "text": text,
                "page_count": 1,
                "format": "txt",
                "line_count": len(text.split("\n"))
            }
        except Exception as e:
            logger.error(f"Text parsing failed: {str(e)}")
            raise
