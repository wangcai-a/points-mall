from pydantic import BaseModel
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price_points: int
    stock: int = 0
    image_url: str = ""
    category: str = ""

class ProductUpdate(BaseModel):
    name: str
    description: str = ""
    price_points: int
    stock: int
    category: str = ""

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price_points: int
    stock: int
    image_url: str
    category: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ProductListResponse(BaseModel):
    list: list[ProductResponse]
    total: int
    page: int
    page_size: int