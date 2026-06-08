from pydantic import BaseModel, Field
from typing import Optional, List

class DocumentUploadRequest(BaseModel):
    """Request model for document upload"""
    filename: str
    file_type: str = Field(..., description="File type: pdf, png, jpg, docx, txt, csv, xlsx")
    metadata: Optional[dict] = None

class BatchUploadRequest(BaseModel):
    """Request model for batch document upload"""
    files: List[str] = Field(..., description="List of file identifiers or paths")
    metadata: Optional[dict] = None
