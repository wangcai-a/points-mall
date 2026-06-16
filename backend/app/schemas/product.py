from pydantic import BaseModel, ConfigDict
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
    image_url: str = ""

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: str | None = None
    price_points: int
    stock: int
    image_url: str | None = None
    category: str | None = None
    created_at: datetime
    updated_at: datetime

class ProductListResponse(BaseModel):
    list: list[ProductResponse]
    total: int
    page: int
    page_size: int