from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class ProfileBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "citizen"
    preferred_language: str = "English"
    area: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    area: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime
