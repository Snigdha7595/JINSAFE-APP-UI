import requests
import json
import os
import re
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# ── Exact dropdown values from Jinsafe SO form ────────────────────────────────
VALID_TYPES = ["Safe Act", "Safe Condition", "Unsafe Act", "Unsafe Condition"]

VALID_CATEGORIES = [
    "Orderliness standard/ House Keeping",
    "Positions of people",
    "PPE",
    "Procedures",
    "Reactions of people",
    "Tools and equipment",
]

VALID_RISKS = ["Extreme", "High", "Moderate", "Low"]


def _rule_based_type(text_lower: str) -> str:
    if any(w in text_lower for w in [
        "operator did", "driver did", "worker did", "mechanic did",
        "person did", "failed to", "did not", "ignored", "bypassed",
        "not following", "violation"
    ]):
        return "Unsafe Act"
    return "Unsafe Condition"


def _rule_based_category(text_lower: str) -> str:
    # Vehicles/equipment FIRST — most common in mining incidents
    if any(w in text_lower for w in [
        "vehicle", "tipper", "truck", "dumper", "crusher", "machine",
        "equipment", "tool", "dump body", "barrier", "collision",
        "body up", "raised body", "indicator", "alarm", "warning system",
        "mechanical", "hydraulic", "electrical fault"
    ]):
        return "Tools and equipment"
    if any(w in text_lower for w in [
        "ppe", "helmet", "glove", "boot", "vest",
        "protective equipment", "safety gear", "harness"
    ]):
        return "PPE"
    if any(w in text_lower for w in [
        "procedure", "sop", "protocol", "rule", "standard",
        "instruction", "permit", "work order", "communicated"
    ]):
        return "Procedures"
    if any(w in text_lower for w in [
        "position", "posture", "standing", "sitting",
        "operator", "driver", "mechanic sitting", "cabin"
    ]):
        return "Positions of people"
    if any(w in text_lower for w in [
        "housekeeping", "house keeping", "orderliness",
        "cleanliness", "waste", "clutter", "spill", "oil spill"
    ]):
        return "Orderliness standard/ House Keeping"
    if any(w in text_lower for w in [
        "reaction", "behavior", "response", "awareness",
        "attention", "distraction", "fatigue"
    ]):
        return "Reactions of people"
    return "Tools and equipment"


def _rule_based_risk(text_lower: str) -> str:
    if any(w in text_lower for w in [
        "fatal", "death", "critical", "explosion",
        "fire", "collapse", "severe", "major injury"
    ]):
        return "Extreme"
    if any(w in text_lower for w in ["minor", "low", "negligible", "small"]):
        return "Low"
    if any(w in text_lower for w in ["moderate", "medium"]):
        return "Moderate"
    return "High"


class OllamaService:
    """Service to interact with Ollama LLM"""

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.fast_model = os.getenv("OLLAMA_FAST_MODEL", "llama3.2")
        self.vision_model = os.getenv("OLLAMA_VISION_MODEL", "llava")
        self.logger = logging.getLogger(__name__)

    async def check_connection(self) -> bool:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception as e:
            self.logger.error(f"Failed to connect to Ollama: {e}")
            return False

    async def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        json_format: bool = False,
        fast: bool = False,
        images: Optional[list] = None,
    ) -> str:
        try:
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            model_name = self.fast_model if fast else self.model
            if images:
                model_name = self.vision_model

            payload = {
                "model": model_name,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.0,
                    "num_predict": 150 if fast else 600,
                    "top_p": 0.3 if fast else 0.95,
                }
            }
            if images:
                payload["images"] = images
            if json_format:
                payload["format"] = "json"

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=60 if fast else 180,
            )
            if response.status_code == 200:
                return response.json().get("response", "")
            else:
                raise Exception(f"Ollama error: {response.status_code}")
        except Exception as e:
            self.logger.error(f"Error generating response: {e}")
            raise

    async def extract_information(self, text: str, prompt_template: str, image_base64: Optional[str] = None) -> Dict[str, Any]:
        """Extract structured information from text using Ollama"""
        try:
            text_truncated = text[:1000] if len(text) > 1000 else text
            full_prompt = prompt_template.format(text=text_truncated)

            images = [image_base64] if image_base64 else None
            is_fast = False if image_base64 else True

            response = await self.generate_response(full_prompt, json_format=True, fast=is_fast, images=images)

            raw_text = response.strip()
            json_block_match = re.search(r"```(?:json)?\s*(.*?)\s*```", raw_text, re.DOTALL)
            if json_block_match:
                raw_text = json_block_match.group(1).strip()
            else:
                first_brace = raw_text.find('{')
                last_brace = raw_text.rfind('}')
                if first_brace != -1 and last_brace != -1:
                    raw_text = raw_text[first_brace:last_brace + 1].strip()

            try:
                return json.loads(raw_text)
            except json.JSONDecodeError as inner_err:
                logger.error(f"Failed parsing JSON: {inner_err}. Text: {raw_text}")
                raise

        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to parse Ollama JSON: {json_err}")
            return {}
        except Exception as e:
            self.logger.error(f"Information extraction failed: {e}")
            raise

    async def extract_observations_from_text(
        self,
        text: str,
        image_base64: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Extract all observation fields from incident report text or image.
        Uses exact Jinsafe dropdown values for Type, Category, Risk.
        """

        text_lower = text.lower()

        # Rule-based pre-analysis used as hints to Ollama and as fallback
        obs_type = _rule_based_type(text_lower)
        category = _rule_based_category(text_lower)
        risk = _rule_based_risk(text_lower)
        location = self._extract_location_fallback(text)
        detail = self._extract_detail_fallback(text)

        text_snippet = text[:1500] if len(text) > 1500 else text

        # ── Image prompt (LLaVA) ──────────────────────────────────────────────
        if image_base64:
            prompt = (
                "You are a safety officer analyzing a safety incident image. "
                "Return ONLY this JSON, no markdown, no explanation:\n"
                '{"observation_detail": "describe the unsafe condition or act in 1-2 sentences",'
                '"observation_type": "Unsafe Condition",'
                '"observation_category": "Tools and equipment",'
                '"observation_subcategory": "describe subcategory",'
                '"observation_subsubcategory": "describe sub-subcategory",'
                '"risk_potential": "High",'
                '"exact_location": "location if visible or empty string"}'
                "\nRules:"
                "\nobservation_type must be one of: Safe Act, Safe Condition, Unsafe Act, Unsafe Condition."
                "\nobservation_category must be one of: Orderliness standard/ House Keeping, Positions of people, PPE, Procedures, Reactions of people, Tools and equipment."
                "\nrisk_potential must be one of: Extreme, High, Moderate, Low."
            )

        # ── Text prompt (llama3.2) ────────────────────────────────────────────
        else:
            prompt = (
                "You are a safety officer. Extract observation fields from this incident report.\n"
                "Return ONLY a valid JSON object. No markdown. No explanation. No extra text.\n\n"
                f"INCIDENT REPORT:\n{text_snippet}\n\n"
                "You MUST choose observation_type from ONLY these exact values:\n"
                "- Safe Act\n"
                "- Safe Condition\n"
                "- Unsafe Act\n"
                "- Unsafe Condition\n\n"
                "You MUST choose observation_category from ONLY these exact values:\n"
                "- Orderliness standard/ House Keeping\n"
                "- Positions of people\n"
                "- PPE\n"
                "- Procedures\n"
                "- Reactions of people\n"
                "- Tools and equipment\n\n"
                "Hint: if the incident involves vehicles, machines, equipment, tippers, crushers, "
                "barriers, alarms or warning systems — choose 'Tools and equipment'.\n"
                "Hint: if it involves operator/driver behavior or body position — choose 'Positions of people'.\n"
                "Hint: if it involves missing/incorrect safety gear — choose 'PPE'.\n"
                "Hint: if it involves not following rules or SOPs — choose 'Procedures'.\n\n"
                "You MUST choose risk_potential from ONLY: Extreme, High, Moderate, Low\n\n"
                "Return this exact JSON structure:\n"
                "{\n"
                '  "observation_detail": "1-2 sentence summary of the key safety issue found in the report",\n'
                f'  "observation_type": "{obs_type}",\n'
                f'  "observation_category": "{category}",\n'
                '  "observation_subcategory": "specific subcategory based on the incident",\n'
                '  "observation_subsubcategory": "specific sub-subcategory if applicable",\n'
                f'  "risk_potential": "{risk}",\n'
                f'  "exact_location": "{location}"\n'
                "}"
            )

        # ── Call Ollama ───────────────────────────────────────────────────────
        try:
            images = [image_base64] if image_base64 else None
            response = await self.generate_response(
                prompt,
                json_format=True,
                fast=False,
                images=images,
            )

            raw = response.strip()
            json_match = re.search(r"```(?:json)?\s*(.*?)\s*```", raw, re.DOTALL)
            if json_match:
                raw = json_match.group(1).strip()
            else:
                first = raw.find('{')
                last = raw.rfind('}')
                if first != -1 and last != -1:
                    raw = raw[first:last+1].strip()

            result = json.loads(raw)

            # Validate and snap to exact dropdown values
            result_type = result.get("observation_type", obs_type)
            if result_type not in VALID_TYPES:
                result_type = obs_type

            result_category = result.get("observation_category", category)
            if result_category not in VALID_CATEGORIES:
                # Fuzzy snap to nearest valid category
                result_category = next(
                    (c for c in VALID_CATEGORIES
                     if c.lower() in result_category.lower()
                     or result_category.lower() in c.lower()),
                    category  # fall back to rule-based
                )

            result_risk = result.get("risk_potential", risk)
            if result_risk not in VALID_RISKS:
                result_risk = risk

            result_location = result.get("exact_location") or location

            return {
                "observation_detail": result.get("observation_detail") or detail,
                "observation_type": result_type,
                "observation_category": result_category,
                "observation_subcategory": result.get("observation_subcategory") or "",
                "observation_subsubcategory": result.get("observation_subsubcategory") or "",
                "risk_potential": result_risk,
                "exact_location": result_location,
            }

        except Exception as e:
            self.logger.error(f"Ollama failed: {e}. Using rule-based fallback.")
            return self._rule_based_extraction(text)

    def _rule_based_extraction(self, text: str) -> Dict[str, Any]:
        """Pure rule-based fallback using exact Jinsafe dropdown values."""
        text_lower = text.lower()
        return {
            "observation_detail": self._extract_detail_fallback(text),
            "observation_type": _rule_based_type(text_lower),
            "observation_category": _rule_based_category(text_lower),
            "observation_subcategory": "",
            "observation_subsubcategory": "",
            "risk_potential": _rule_based_risk(text_lower),
            "exact_location": self._extract_location_fallback(text),
        }

    def _extract_detail_fallback(self, text: str) -> str:
        """Rule-based fallback for observation detail."""
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in lines:
            lower = line.lower()
            if any(w in lower for w in [
                "happened", "incident", "collision", "found", "observed",
                "detected", "raised", "struck", "hit", "fell", "while",
                "tipper", "dump body", "vehicle", "worker"
            ]):
                return line[:300]
        for line in lines:
            if len(line) > 40:
                return line[:300]
        return text[:300]

    def _extract_location_fallback(self, text: str) -> str:
        """Rule-based fallback for location."""
        patterns = [
            r"location[:\s]+([^\n,\.]{3,60})",
            r"at\s+(?:the\s+)?([A-Z][a-zA-Z\s]{2,40}(?:gate|mine|plant|area|section|floor|zone|hopper|crusher))",
            r"([A-Z][a-zA-Z\s]{2,30}(?:Gate|Mine|Plant|Area|Section|Floor|Zone|Hopper|Crusher))",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""