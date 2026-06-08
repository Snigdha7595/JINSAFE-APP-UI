# File size constants
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Supported file types
SUPPORTED_FILE_TYPES = {
    "image": ["png", "jpg", "jpeg"],
    "document": ["pdf", "docx", "txt"],
    "data": ["csv", "xlsx"]
}

# Severity levels for observations
SEVERITY_LEVELS = ["low", "medium", "high", "critical"]

# API endpoints
API_PREFIX = "/api/v1"
UPLOAD_ENDPOINT = f"{API_PREFIX}/upload"
BATCH_UPLOAD_ENDPOINT = f"{API_PREFIX}/batch-upload"
HEALTH_CHECK_ENDPOINT = f"{API_PREFIX}/health"
