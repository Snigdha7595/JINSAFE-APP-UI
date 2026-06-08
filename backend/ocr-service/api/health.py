from fastapi import APIRouter, HTTPException
from services.ollama_service import OllamaService

router = APIRouter()
ollama_service = OllamaService()

@router.get("/health")
async def health_check():
    """Check the health status of the OCR service and dependencies"""
    try:
        # Check Ollama service
        ollama_status = await ollama_service.check_connection()
        
        return {
            "status": "healthy",
            "components": {
                "api": "running",
                "ollama": "connected" if ollama_status else "disconnected"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
