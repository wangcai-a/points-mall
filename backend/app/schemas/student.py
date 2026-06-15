from pydantic import BaseModel
from datetime import datetime

class StudentCreate(BaseModel):
    name: str
    class_name: str
    total_points: int = 0

class StudentUpdate(BaseModel):
    name: str
    class_name: str

class StudentResponse(BaseModel):
    id: int
    name: str
    class_name: str
    total_points: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

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