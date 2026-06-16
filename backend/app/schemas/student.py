from pydantic import BaseModel, ConfigDict
from datetime import datetime

class StudentCreate(BaseModel):
    name: str
    class_name: str
    total_points: int = 0

class StudentUpdate(BaseModel):
    name: str
    class_name: str

class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    class_name: str
    total_points: int
    created_at: datetime
    updated_at: datetime

class StudentListResponse(BaseModel):
    list: list[StudentResponse]
    total: int
    page: int
    page_size: int

class PointsHistoryResponse(BaseModel):
    id: int
    change_amount: int
    reason: str
    type: str
    teacher_name: str
    created_at: datetime

class PointsHistoryListResponse(BaseModel):
    list: list[PointsHistoryResponse]
    total: int

class StudentImportPreview(BaseModel):
    row: int
    name: str
    class_name: str
    total_points: int = 0
    valid: bool = True
    error: str | None = None

class StudentImportResponse(BaseModel):
    success_count: int
    fail_count: int