import pandas as pd
import logging
from typing import Dict, Any
import io

logger = logging.getLogger(__name__)

class XlsxParser:
    """Parser for XLSX Excel files"""
    
    async def parse(self, file_content: bytes) -> Dict[str, Any]:
        """Parse XLSX file"""
        try:
            excel_file = pd.ExcelFile(io.BytesIO(file_content))
            
            text = ""
            sheet_count = len(excel_file.sheet_names)
            
            for sheet in excel_file.sheet_names:
                df = pd.read_excel(io.BytesIO(file_content), sheet_name=sheet)
                text += f"\n--- Sheet: {sheet} ---\n{df.to_string()}\n"
            
            return {
                "text": text,
                "page_count": sheet_count,
                "format": "xlsx",
                "sheet_count": sheet_count,
                "sheets": excel_file.sheet_names
            }
        except Exception as e:
            logger.error(f"XLSX parsing failed: {str(e)}")
            raise
