import requests
import json
import os
import re
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class OllamaService:
    """Service to interact with Ollama LLM"""

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "gemma:2b")
        self.fast_model = os.getenv("OLLAMA_FAST_MODEL", self.model)
        self.vision_model = os.getenv("OLLAMA_VISION_MODEL", "llava")
        self.logger = logging.getLogger(__name__)

    async def check_connection(self) -> bool:
        """Check if Ollama service is available"""
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
        """Generate response from Ollama model"""
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
                    "num_predict": 80 if fast else 512,
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
                timeout=15 if fast else 60,
            )
            if response.status_code == 200:
                return response.json().get("response", "")
            else:
                raise Exception(f"Ollama error: {response.status_code}")
        except Exception as e:
            self.logger.error(f"Error generating response: {e}")
            raise

    async def extract_information(self, text: str, prompt_template: str, image_base64: Optional[str] = None) -> Dict[str, Any]:
        """Extract structured information from text (and optional image) using Ollama"""
        try:
            text_truncated = text[:1000] if len(text) > 1000 else text
            full_prompt = prompt_template.format(text=text_truncated)
            
            images = [image_base64] if image_base64 else None
            is_fast = False if image_base64 else True
            
            response = await self.generate_response(full_prompt, json_format=True, fast=is_fast, images=images)
            
            # Resilient cleaning to handle Markdown and conversational prefixes/suffixes
            raw_text = response.strip()
            
            # 1. Search for markdown code block first
            json_block_match = re.search(r"```(?:json)?\s*(.*?)\s*```", raw_text, re.DOTALL)
            if json_block_match:
                raw_text = json_block_match.group(1).strip()
            else:
                # 2. Search for the first '{' and last '}'
                first_brace = raw_text.find('{')
                last_brace = raw_text.rfind('}')
                if first_brace != -1 and last_brace != -1:
                    raw_text = raw_text[first_brace:last_brace + 1].strip()
            
            try:
                parsed_json = json.loads(raw_text)
                return parsed_json
            except json.JSONDecodeError as inner_err:
                logger.error(
                    f"Failed parsing cleaned JSON text: {inner_err}. Cleaned text was: {raw_text}"
                )
                raise
                
        except json.JSONDecodeError as json_err:
            logger.error(
                f"Failed to parse Ollama JSON response: {json_err}. Raw response: {response}"
            )
            return {"observations": []}
        except Exception as e:
            self.logger.error(f"Information extraction failed: {e}")
            raise
