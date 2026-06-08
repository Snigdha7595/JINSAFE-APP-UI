import logging
from typing import Dict, Any, List
from services.ollama_service import OllamaService
from services.audit_service import AuditService

logger = logging.getLogger(__name__)

class ObservationGenerator:
    """Generate observations and insights from extracted document data"""
    
    def __init__(self):
        self.ollama_service = OllamaService()
        self.audit_service = AuditService()
        self.logger = logging.getLogger(__name__)
    
    async def generate_observations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate audit observations from document data"""
        try:
            # Load observation prompt
            with open("./prompts/observation_prompt.txt", "r") as f:
                prompt_template = f.read()
            
            # Extract observations using Ollama
            extracted_text = data.get("text", "")
            image_base64 = data.get("image_base64")
            observations_json = await self.ollama_service.extract_information(
                extracted_text, 
                prompt_template,
                image_base64=image_base64
            )
            
            # Log the generation
            await self.audit_service.log_observation_generation(
                data.get("filename", "unknown"),
                observations_json
            )
            
            return observations_json
        except Exception as e:
            self.logger.error(f"Failed to generate observations: {str(e)}")
            raise
