from fastapi import UploadFile
from typing import Dict, Any
import logging
from parsers.image_parser import ImageParser
from parsers.pdf_parser import PDFParser
from parsers.docx_parser import DocxParser
from parsers.txt_parser import TxtParser
from parsers.csv_parser import CSVParser
from parsers.xlsx_parser import XlsxParser

logger = logging.getLogger(__name__)

class DocumentRouter:
    """Routes documents to appropriate parsers based on file type"""
    
    def __init__(self):
        self.image_parser = ImageParser()
        self.pdf_parser = PDFParser()
        self.docx_parser = DocxParser()
        self.txt_parser = TxtParser()
        self.csv_parser = CSVParser()
        self.xlsx_parser = XlsxParser()
        self.logger = logging.getLogger(__name__)
    
    async def route_document(self, file: UploadFile, file_type: str) -> Dict[str, Any]:
        """Route document to appropriate parser"""
        
        self.logger.info(f"Routing document: {file.filename}, type: {file_type}")
        file_content = await file.read()
        self.logger.info(f"File content size: {len(file_content)} bytes")
        
        if file_type in ["png", "jpg", "jpeg"]:
            self.logger.info("Using ImageParser for image file")
            result = await self.image_parser.parse(file_content)
            self.logger.info(f"ImageParser returned keys: {result.keys()}")
            return result
        
        elif file_type == "pdf":
            self.logger.info("Using PDFParser for PDF file")
            return await self.pdf_parser.parse(file_content)
        
        elif file_type == "docx":
            self.logger.info("Using DocxParser for DOCX file")
            return await self.docx_parser.parse(file_content)
        
        elif file_type == "txt":
            self.logger.info("Using TxtParser for TXT file")
            return await self.txt_parser.parse(file_content)
        
        elif file_type == "csv":
            self.logger.info("Using CSVParser for CSV file")
            return await self.csv_parser.parse(file_content)
        
        elif file_type == "xlsx":
            self.logger.info("Using XlsxParser for XLSX file")
            return await self.xlsx_parser.parse(file_content)
        
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
