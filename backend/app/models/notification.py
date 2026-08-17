from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    issue_id: Optional[str] = None
    type: str
    message: str
    is_read: bool
    created_at: datetime
    issue_title: Optional[str] = None

class NotificationUpdate(BaseModel):
    is_read: bool = True
