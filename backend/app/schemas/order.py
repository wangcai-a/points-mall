from pydantic import BaseModel
from datetime import datetime

class OrderCreate(BaseModel):
    student_id: int
    product_id: int

class OrderUpdate(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    product_id: int
    product_name: str
    teacher_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class OrderDetailResponse(BaseModel):
    id: int
    student: dict
    product: dict
    status: str
    created_at: datetime
    completed_at: datetime | None

class OrderListResponse(BaseModel):
    list: list[OrderResponse]
    total: int
    page: int
    page_size: int