import json
import os
import re
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Dict, Any
from services.ocr_service import OCRService
from services.document_router import DocumentRouter
from models.response_models import DocumentProcessResponse
from utils.ocr_engine import save_json_result
logger = logging.getLogger(__name__)

router = APIRouter()
ocr_service = OCRService()
document_router = DocumentRouter()


def _normalize_label(label: str) -> str:
    return label.strip().lower().replace("_", " ").replace("-", " ")


def _extract_field_from_text(text: str, labels: List[str]) -> str:
    if not text:
        return ""

    for label in labels:
        escaped_label = re.escape(label)
        pattern = re.compile(rf"{escaped_label}\s*[:\-–]?\s*(.+)", re.IGNORECASE)
        for line in text.splitlines():
            match = pattern.search(line)
            if match:
                return match.group(1).strip()
    return ""


def _extract_field_mappings(text: str, unit_details: Dict[str, Any]) -> Dict[str, Any]:
    label_aliases = {
        "unitDisplay": ["unit name", "unit", "unit_name", "unitname", "site", "facility"],
        "departmentDisplay": ["department", "department name", "dept", "division"],
        "sectionDisplay": ["visited section", "visited_section", "section", "section visited", "area", "area name"],
        "hod": ["hod name", "hod", "head of department", "manager"],
        "nameObserver": ["observer name", "name of observer", "observer", "inspector", "inspected by", "reported by"],
        "siDate": ["so date", "si date", "date", "safety observation date", "inspection date"],
        "duration": ["duration", "time", "time spent", "duration of observation", "inspection duration"],
        "observationName": ["observation name", "name of observation", "observation title", "alert name", "finding name", "issue name"]
    }

    mappings: Dict[str, Any] = {}

    if isinstance(unit_details, dict):
        for key, value in unit_details.items():
            normalized_key = _normalize_label(str(key))
            for field_name, aliases in label_aliases.items():
                if any(alias in normalized_key for alias in aliases):
                    if value is not None and value != "":
                        mappings[field_name] = value

    for field_name, aliases in label_aliases.items():
        if mappings.get(field_name):
            continue

        extracted = _extract_field_from_text(text, aliases)
        if extracted:
            mappings[field_name] = extracted

    return mappings

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a document
    Supports: PDF, images (PNG, JPG), DOCX, TXT, CSV, XLSX
    """
    try:
        # Validate file
        file_type = file.filename.split('.')[-1].lower()
        logger.info(f"Uploading file: {file.filename}, type: {file_type}")
        
        # Route document to appropriate parser
        processed_data = await document_router.route_document(file, file_type)
        logger.info(f"Processed data keys: {processed_data.keys()}")
        logger.info(f"Extracted text length: {len(processed_data.get('text', ''))} chars")
        logger.info(f"Extracted text preview: {processed_data.get('text', '')[:200]}")
        
        # Extract observations using Ollama
        try:
            extracted_res = await ocr_service.extract_observations(processed_data)
            observations = extracted_res.get("observations", [])
            unit_details = extracted_res.get("unit_details", {})
        except Exception as obs_err:
            logger.error(f"Observation extraction failed: {obs_err}")
            observations = []
            unit_details = {}

        field_mappings = _extract_field_mappings(processed_data.get("text", ""), unit_details)
        if not field_mappings.get("observationName") and observations:
            field_mappings["observationName"] = observations[0].get("title", "")

        response_data = {
            "success": True,
            "filename": file.filename,
            "extracted_text": processed_data.get("text", ""),
            "observations": observations,
            "metadata": {
                "file_type": file_type,
                "pages": processed_data.get("page_count", 1),
                "unit_details": unit_details
            },
            "field_mappings": field_mappings,
        }

        try:
            save_json_result(file.filename, response_data)
        except Exception as save_err:
            logger.warning(f"Failed to save result JSON: {save_err}")

        return DocumentProcessResponse(**response_data)
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/extract-fields")
async def extract_fields(file: UploadFile = File(...)):
    """Extract only OCR text and structured field mappings quickly"""
    try:
        file_type = file.filename.split('.')[-1].lower()
        logger.info(f"Fast extracting fields for file: {file.filename}, type: {file_type}")

        processed_data = await document_router.route_document(file, file_type)
        logger.info(f"Fast extract processed data keys: {processed_data.keys()}")

        field_mappings = _extract_field_mappings(processed_data.get("text", ""), {})

        response_data = {
            "success": True,
            "filename": file.filename,
            "extracted_text": processed_data.get("text", ""),
            "observations": [],
            "metadata": {
                "file_type": file_type,
                "pages": processed_data.get("page_count", 1)
            },
            "field_mappings": field_mappings,
        }

        return DocumentProcessResponse(**response_data)
    except Exception as e:
        logger.error(f"Field extraction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/batch-upload")
async def batch_upload_documents(files: List[UploadFile] = File(...)):
    """Process multiple documents in batch"""
    results = []
    
    for file in files:
        try:
            file_type = file.filename.split('.')[-1].lower()
            processed_data = await document_router.route_document(file, file_type)
            extracted_res = await ocr_service.extract_observations(processed_data)
            observations = extracted_res.get("observations", [])
            unit_details = extracted_res.get("unit_details", {})
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "observations": observations,
                "unit_details": unit_details
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
    
    return {"batch_results": results}

@router.get("/history")
async def get_upload_history(skip: int = 0, limit: int = 10):
    """Retrieve document upload history"""
    # Implementation for database query
    pass

@router.get("/audit-logs")
async def get_audit_logs(skip: int = 0, limit: int = 10):
    """Retrieve audit logs"""
    # Implementation for audit log retrieval
    pass
