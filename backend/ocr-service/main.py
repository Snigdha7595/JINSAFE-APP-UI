import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.routes import router as api_router
from api.health import router as health_router
from utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logger
logger = setup_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="OCR Service",
    description="Optical Character Recognition and Document Processing Service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from fastapi import UploadFile, File

@app.post("/upload")
async def legacy_upload(file: UploadFile = File(...)):
    """Legacy endpoint delegating to api.routes.upload_document"""
    from api.routes import upload_document
    return await upload_document(file)

app.include_router(api_router, prefix="/api/v1", tags=["documents"])
from api.routes import upload_document as api_upload

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Legacy endpoint for compatibility (delegates to API router)"""
    return await api_upload(file)

@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("OCR Service starting up...")
    
    # Create necessary directories
    os.makedirs("logs", exist_ok=True)
    os.makedirs("storage/uploads", exist_ok=True)
    os.makedirs("storage/processed", exist_ok=True)
    os.makedirs("storage/temp", exist_ok=True)

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("OCR Service shutting down...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "OCR Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/v1/health",
            "upload": "/api/v1/upload",
            "batch_upload": "/api/v1/batch-upload",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    
    uvicorn.run(app, host=host, port=port)
