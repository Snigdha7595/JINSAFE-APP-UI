import pandas as pd
import logging
from typing import Dict, Any
import io

logger = logging.getLogger(__name__)

class CSVParser:
    """Parser for CSV files"""
    
    async def parse(self, file_content: bytes) -> Dict[str, Any]:
        """Parse CSV file"""
        try:
            df = pd.read_csv(io.BytesIO(file_content))
            
            text = df.to_string()
            
            return {
                "text": text,
                "page_count": 1,
                "format": "csv",
                "row_count": len(df),
                "column_count": len(df.columns),
                "columns": list(df.columns)
            }
        except Exception as e:
            logger.error(f"CSV parsing failed: {str(e)}")
            raise
