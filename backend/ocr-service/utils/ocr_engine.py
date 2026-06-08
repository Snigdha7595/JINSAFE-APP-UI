import io
import json
import os
import logging
from typing import Any, Dict
from PIL import Image

logger = logging.getLogger(__name__)

PADDLE_OCR_AVAILABLE = False
paddle_ocr = None

try:
    from paddleocr import PaddleOCR
    import numpy as np
    PADDLE_OCR_AVAILABLE = True
except Exception as e:
    logger.warning(f"PaddleOCR unavailable: {e}. Falling back to pytesseract.")


def _load_paddle_ocr() -> Any:
    global paddle_ocr
    if paddle_ocr is None and PADDLE_OCR_AVAILABLE:
        paddle_ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    return paddle_ocr


def _paddle_ocr_image(image: Image.Image) -> str:
    ocr = _load_paddle_ocr()
    if not ocr:
        raise RuntimeError("PaddleOCR engine is not available")

    img_array = np.array(image.convert("RGB"))
    results = ocr.ocr(img_array, cls=True)
    lines = []
    for page in results:
        for line in page:
            if len(line) >= 2 and isinstance(line[1], (list, tuple)):
                text = line[1][0]
                lines.append(text)
            elif len(line) >= 2 and isinstance(line[1], str):
                lines.append(line[1])
    return "\n".join(lines)


def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")

        if PADDLE_OCR_AVAILABLE:
            try:
                logger.info("Extracting text using PaddleOCR")
                return _paddle_ocr_image(image)
            except Exception as paddle_err:
                logger.warning(f"PaddleOCR extraction failed: {paddle_err}. Falling back to Tesseract.")

        import pytesseract
        logger.info("Extracting text using Tesseract")
        return pytesseract.image_to_string(image)
    except Exception as e:
        logger.error(f"OCR extraction from image bytes failed: {e}")
        raise


def save_json_result(file_name: str, output: Dict[str, Any]) -> str:
    target_dir = "storage/processed"
    os.makedirs(target_dir, exist_ok=True)
    json_name = f"{os.path.splitext(file_name)[0]}.json"
    output_path = os.path.join(target_dir, json_name)
    with open(output_path, "w", encoding="utf-8") as json_file:
        json.dump(output, json_file, ensure_ascii=False, indent=2)
    logger.info(f"Saved processed JSON: {output_path}")
    return output_path
