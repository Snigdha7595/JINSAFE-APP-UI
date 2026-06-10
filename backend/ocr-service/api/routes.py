import json
import os
import re
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from services.document_router import DocumentRouter
from models.response_models import DocumentProcessResponse
from utils.ocr_engine import save_json_result

logger = logging.getLogger(__name__)

router = APIRouter()
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


def _extract_field_mappings(text: str, extra: Dict[str, Any] = {}) -> Dict[str, Any]:
    label_aliases = {
        "unitDisplay": ["unit name", "unit", "site", "facility"],
        "departmentDisplay": ["department", "department name", "dept", "division"],
        "sectionDisplay": ["visited section", "section", "area"],
        "hod": ["hod name", "hod", "head of department", "manager"],
        "nameObserver": ["observer name", "name of observer", "observer", "reported by", "inspected by"],
        "siDate": ["so date", "si date", "date of incident", "date", "inspection date"],
        "duration": ["duration", "time spent", "inspection duration"],
    }

    mappings: Dict[str, Any] = {}

    # Pull from extra dict first (e.g. Ollama field_mappings)
    if isinstance(extra, dict):
        for key, value in extra.items():
            normalized_key = _normalize_label(str(key))
            for field_name, aliases in label_aliases.items():
                if any(alias in normalized_key for alias in aliases):
                    if value is not None and str(value).strip() != "":
                        mappings[field_name] = value

    # Then try regex extraction from raw text
    for field_name, aliases in label_aliases.items():
        if mappings.get(field_name):
            continue
        extracted = _extract_field_from_text(text, aliases)
        if extracted:
            mappings[field_name] = extracted

    return mappings


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document. Supports PDF, PNG, JPG, DOCX, TXT, CSV, XLSX."""
    try:
        file_type = file.filename.split('.')[-1].lower()
        logger.info(f"Uploading file: {file.filename}, type: {file_type}")

        # Route to parser + Ollama extraction (all done inside document_router)
        processed_data = await document_router.route_document(file, file_type)
        logger.info(f"Processed data keys: {list(processed_data.keys())}")

        raw_text = processed_data.get("text", "") or processed_data.get("extracted_text", "")
        observations = processed_data.get("observations", [])
        ollama_field_mappings = processed_data.get("field_mappings", {})

        # Merge Ollama field mappings with regex-based extraction
        field_mappings = _extract_field_mappings(raw_text, ollama_field_mappings)

        response_data = {
            "success": True,
            "filename": file.filename,
            "extracted_text": raw_text,
            "observations": observations,
            "metadata": {
                "file_type": file_type,
                "pages": processed_data.get("page_count", 1),
            },
            "field_mappings": field_mappings,
        }

        try:
            save_json_result(file.filename, response_data)
        except Exception as save_err:
            logger.warning(f"Failed to save result JSON: {save_err}")

        logger.info(f"Returning {len(observations)} observations, {len(field_mappings)} field mappings")
        return DocumentProcessResponse(**response_data)

    except Exception as e:
        logger.error(f"Upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/extract-fields")
async def extract_fields(file: UploadFile = File(...)):
    """Extract only OCR text and structured field mappings quickly."""
    try:
        file_type = file.filename.split('.')[-1].lower()
        logger.info(f"Fast extracting fields for: {file.filename}, type: {file_type}")

        processed_data = await document_router.route_document(file, file_type)

        raw_text = processed_data.get("text", "") or processed_data.get("extracted_text", "")
        ollama_field_mappings = processed_data.get("field_mappings", {})
        field_mappings = _extract_field_mappings(raw_text, ollama_field_mappings)

        response_data = {
            "success": True,
            "filename": file.filename,
            "extracted_text": raw_text,
            "observations": processed_data.get("observations", []),
            "metadata": {
                "file_type": file_type,
                "pages": processed_data.get("page_count", 1),
            },
            "field_mappings": field_mappings,
        }

        return DocumentProcessResponse(**response_data)

    except Exception as e:
        logger.error(f"Field extraction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/batch-upload")
async def batch_upload_documents(files: List[UploadFile] = File(...)):
    """Process multiple documents in batch."""
    results = []
    for file in files:
        try:
            file_type = file.filename.split('.')[-1].lower()
            processed_data = await document_router.route_document(file, file_type)
            results.append({
                "filename": file.filename,
                "status": "success",
                "observations": processed_data.get("observations", []),
                "field_mappings": processed_data.get("field_mappings", {}),
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e),
            })
    return {"batch_results": results}


@router.get("/history")
async def get_upload_history(skip: int = 0, limit: int = 10):
    """Retrieve document upload history."""
    pass


@router.get("/audit-logs")
async def get_audit_logs(skip: int = 0, limit: int = 10):
    """Retrieve audit logs."""
    pass