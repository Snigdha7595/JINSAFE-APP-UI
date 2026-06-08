from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AuditObservation(BaseModel):
    """Model for audit observations"""
    id: Optional[str] = None
    title: str
    description: str
    severity: str = "medium"  # low, medium, high, critical
    category: str
    recommendation: Optional[str] = None

class DocumentProcessResponse(BaseModel):
    """Response model for document processing"""
    success: bool
    filename: str
    extracted_text: str
    observations: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    field_mappings: Dict[str, Any] = {}

class BatchProcessResponse(BaseModel):
    """Response model for batch processing"""
    total_files: int
    successful: int
    failed: int
    results: List[Dict[str, Any]]

class HealthCheckResponse(BaseModel):
    """Response model for health check"""
    status: str
    components: Dict[str, str]
