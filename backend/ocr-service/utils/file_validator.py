import os
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "docx", "txt", "csv", "xlsx"]
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB in bytes

class FileValidator:
    """Validator for uploaded files"""
    
    @staticmethod
    def validate_file_type(filename: str) -> Tuple[bool, str]:
        """Validate file type"""
        ext = filename.split(".")[-1].lower()
        
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"File type '{ext}' not supported"
        
        return True, "Valid"
    
    @staticmethod
    def validate_file_size(file_size: int) -> Tuple[bool, str]:
        """Validate file size"""
        if file_size > MAX_FILE_SIZE:
            return False, f"File size exceeds maximum allowed size ({MAX_FILE_SIZE} bytes)"
        
        return True, "Valid"
    
    @staticmethod
    def validate_file(filename: str, file_size: int) -> Tuple[bool, str]:
        """Validate file"""
        is_valid, msg = FileValidator.validate_file_type(filename)
        if not is_valid:
            return is_valid, msg
        
        is_valid, msg = FileValidator.validate_file_size(file_size)
        return is_valid, msg
