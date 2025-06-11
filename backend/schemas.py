# schemas.py
from pydantic import BaseModel, Field, validator
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    password: str = Field(..., min_length=8)

    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@ups.com'):
            raise ValueError('Email must end with @ups.com')
        return v

    @validator('password')
    def validate_password_complexity(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*(),.?":{}|<>' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserResponse(BaseModel):
    username: str
    email: str | None = None

class UserInDB(UserResponse):
    hashed_password: str

class UploadRecordBase(BaseModel):
    filename: str
    upload_status: str | None = "pending"
    extract_status: str | None = "pending"
    tracking_id: str | None = None
    address: str | None = None
    name: str | None = None
    city: str | None = None
    number: str | None = None
    pincode: str | None = None
    country: str | None = None
    extracted_info: dict | None = None

class UploadRecordCreate(UploadRecordBase):
    pass

class UploadRecordResponse(UploadRecordBase):
    id: int
    upload_timestamp: datetime

    class Config:
        from_attributes = True

class PaginatedUploadRecords(BaseModel):
    total: int
    page: int
    size: int
    items: list[UploadRecordResponse] 