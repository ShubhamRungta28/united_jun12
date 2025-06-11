# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class UploadRecord(Base):
    __tablename__ = "upload_records"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    upload_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    upload_status = Column(String, default="pending") # e.g., "successful", "failed"
    extract_status = Column(String, default="pending") # e.g., "successful", "failed"
    tracking_id = Column(String, index=True, nullable=True)
    address = Column(String, nullable=True)
    name = Column(String, nullable=True)
    city = Column(String, nullable=True)
    number = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    country = Column(String, nullable=True)
    extracted_info = Column(JSON, nullable=True) # To store the full extracted JSON data 