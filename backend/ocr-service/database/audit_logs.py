from sqlalchemy import Column, String, DateTime, JSON, Integer
from datetime import datetime
from .database import Base

class AuditLog(Base):
    """Model for audit logs"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event = Column(String)
    filename = Column(String)
    details = Column(JSON)
