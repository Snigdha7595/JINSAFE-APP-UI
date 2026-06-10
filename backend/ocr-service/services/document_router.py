from fastapi import UploadFile
from typing import Dict, Any, Optional
import logging
import base64
from parsers.image_parser import ImageParser
from parsers.pdf_parser import PDFParser
from parsers.docx_parser import DocxParser
from parsers.txt_parser import TxtParser
from parsers.csv_parser import CSVParser
from parsers.xlsx_parser import XlsxParser
from services.ollama_service import OllamaService
from PIL import Image as PILImage
from PIL import ImageEnhance
import io

logger = logging.getLogger(__name__)

# ── Prompt templates (no curly braces inside except {text}) ───────────────────
METADATA_PROMPT = (
    "Extract safety observation form header fields from this incident report text. "
    "Return ONLY a valid JSON object with exactly these keys: "
    "unit, department, section, hod, nameObserver, siDate, duration. "
    "Use empty string for any field not found in the text. "
    "Do not include any explanation or markdown.\n\n"
    "Text:\n{text}"
)

# Max dimension for images sent to LLaVA — keeps processing fast without
# losing enough detail for safety observation identification
LLAVA_MAX_DIMENSION = 800


def _resize_and_enhance_for_llava(file_content: bytes) -> bytes:
    """
    Resize image to max 800x800 and boost brightness/contrast for dark images.
    Returns JPEG bytes ready for base64 encoding.
    Falls back to original bytes on any error.
    """
    try:
        img = PILImage.open(io.BytesIO(file_content)).convert("RGB")

        # ── Resize if larger than max dimension ──────────────────────────────
        original_size = img.size
        img.thumbnail((LLAVA_MAX_DIMENSION, LLAVA_MAX_DIMENSION), PILImage.LANCZOS)
        if img.size != original_size:
            logger.info(f"Resized image from {original_size} to {img.size} for LLaVA")

        # ── Enhance dark images ───────────────────────────────────────────────
        # Calculate average brightness (0=black, 255=white)
        import struct
        grayscale = img.convert("L")
        histogram = grayscale.histogram()
        pixels = sum(histogram)
        brightness = sum(i * histogram[i] for i in range(256)) / pixels

        if brightness < 80:
            # Dark image (e.g. night-time site photos) — boost brightness and contrast
            logger.info(f"Dark image detected (avg brightness={brightness:.0f}), enhancing for LLaVA")
            img = ImageEnhance.Brightness(img).enhance(2.0)
            img = ImageEnhance.Contrast(img).enhance(1.5)

        # ── Save as JPEG ──────────────────────────────────────────────────────
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue()

    except Exception as e:
        logger.warning(f"Image preprocessing failed, using original: {e}")
        return file_content


class DocumentRouter:
    """Routes documents to appropriate parsers based on file type"""

    def __init__(self):
        self.image_parser = ImageParser()
        self.pdf_parser = PDFParser()
        self.docx_parser = DocxParser()
        self.txt_parser = TxtParser()
        self.csv_parser = CSVParser()
        self.xlsx_parser = XlsxParser()
        self.ollama_service = OllamaService()
        self.logger = logging.getLogger(__name__)

    async def route_document(self, file: UploadFile, file_type: str) -> Dict[str, Any]:
        """Route document to appropriate parser, then extract observations via Ollama"""

        self.logger.info(f"Routing document: {file.filename}, type: {file_type}")
        file_content = await file.read()
        self.logger.info(f"File content size: {len(file_content)} bytes")

        # ── Step 1: Parse the file ─────────────────────────────────────────────
        is_image = file_type in ["png", "jpg", "jpeg", "webp"]

        if is_image:
            self.logger.info("Using ImageParser for image file")
            result = await self.image_parser.parse(file_content)
            self.logger.info(f"ImageParser returned keys: {result.keys()}")

        elif file_type == "pdf":
            self.logger.info("Using PDFParser for PDF file")
            result = await self.pdf_parser.parse(file_content)

        elif file_type == "docx":
            self.logger.info("Using DocxParser for DOCX file")
            result = await self.docx_parser.parse(file_content)

        elif file_type == "txt":
            self.logger.info("Using TxtParser for TXT file")
            result = await self.txt_parser.parse(file_content)

        elif file_type == "csv":
            self.logger.info("Using CSVParser for CSV file")
            result = await self.csv_parser.parse(file_content)

        elif file_type == "xlsx":
            self.logger.info("Using XlsxParser for XLSX file")
            result = await self.xlsx_parser.parse(file_content)

        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        # ── Step 2: Extract observations via Ollama ────────────────────────────
        extracted_text = result.get("text", "") or ""
        image_b64: Optional[str] = None

        if is_image:
            try:
                # Resize and enhance before encoding — faster LLaVA, better dark image accuracy
                processed_bytes = _resize_and_enhance_for_llava(file_content)
                image_b64 = base64.b64encode(processed_bytes).decode("utf-8")
                self.logger.info(
                    f"Image preprocessed: original={len(file_content)}B "
                    f"processed={len(processed_bytes)}B"
                )
            except Exception as e:
                self.logger.warning(f"Could not encode image to base64: {e}")

        observations = []
        has_enough_text = len(extracted_text.strip()) > 30

        if has_enough_text or image_b64:
            try:
                self.logger.info("Extracting observations via Ollama...")
                obs = await self.ollama_service.extract_observations_from_text(
                    text=extracted_text or "Analyze this safety incident image and extract observation details.",
                    image_base64=image_b64,
                )
                if obs and obs.get("observation_detail"):
                    observations = [obs]
                    self.logger.info(f"Extracted observation: {obs.get('observation_detail', '')[:80]}")
                else:
                    self.logger.warning("Ollama returned empty observation — using rule-based fallback")
                    obs = self.ollama_service._rule_based_extraction(extracted_text)
                    if obs and obs.get("observation_detail"):
                        observations = [obs]
            except Exception as e:
                self.logger.error(f"Observation extraction failed: {e}")
                try:
                    obs = self.ollama_service._rule_based_extraction(extracted_text)
                    if obs and obs.get("observation_detail"):
                        observations = [obs]
                        self.logger.info("Used rule-based fallback for observations")
                except Exception:
                    pass

        # ── Step 3: Extract metadata/unit fields ──────────────────────────────
        field_mappings = result.get("field_mappings", {})
        if has_enough_text and not field_mappings:
            try:
                field_mappings = await self.ollama_service.extract_information(
                    extracted_text,
                    METADATA_PROMPT,
                )
                self.logger.info(f"Extracted field mappings: {list(field_mappings.keys())}")
            except Exception as e:
                self.logger.warning(f"Field mapping extraction failed: {e}")
                field_mappings = {}

        # ── Step 4: Build final response ──────────────────────────────────────
        return {
            **result,
            "observations": observations,
            "field_mappings": field_mappings or {},
            "extracted_text": extracted_text,
        }