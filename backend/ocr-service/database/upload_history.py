from sqlalchemy import Column, String, DateTime, Integer, JSON
from datetime import datetime
from .database import Base

class UploadHistory(Base):
    """Model for upload history"""
    __tablename__ = "upload_history"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_type = Column(String)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    file_size = Column(Integer)
    metadata = Column(JSON)
