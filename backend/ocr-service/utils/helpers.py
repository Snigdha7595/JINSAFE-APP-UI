import os
from datetime import datetime
from typing import Any, Dict

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return filename.split(".")[-1].lower()

def get_timestamp() -> str:
    """Get current timestamp in ISO format"""
    return datetime.utcnow().isoformat()

def format_file_size(size_bytes: int) -> str:
    """Format bytes to human readable format"""
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def create_response(success: bool, data: Any = None, error: str = None) -> Dict:
    """Create standardized API response"""
    response = {
        "success": success,
        "timestamp": get_timestamp()
    }
    
    if data:
        response["data"] = data
    
    if error:
        response["error"] = error
    
    return response
