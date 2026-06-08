import unittest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestAPIEndpoints(unittest.TestCase):
    """Tests for API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
    
    def test_upload_endpoint(self):
        """Test document upload endpoint"""
        pass

if __name__ == "__main__":
    unittest.main()
