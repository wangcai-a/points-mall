from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import get_products, get_categories, get_product, create_product, update_product, delete_product
from app.database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=dict)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category: str = Query(None),
    db: Session = Depends(get_db)
):
    result = get_products(db, page, page_size, category)
    return {"code": 200, "data": result}

@router.get("/categories", response_model=dict)
def list_categories(db: Session = Depends(get_db)):
    categories = get_categories(db)
    return {"code": 200, "data": categories}

@router.get("/{product_id}", response_model=dict)
def get_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return {"code": 200, "data": ProductResponse.model_validate(product).model_dump()}

@router.post("", response_model=dict)
def create_product_endpoint(product: ProductCreate, db: Session = Depends(get_db)):
    result = create_product(db, product)
    return {"code": 200, "message": "创建成功", "data": {"id": result.id}}

@router.put("/{product_id}", response_model=dict)
def update_product_endpoint(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    product = update_product(db, product_id, product_update)
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return {"code": 200, "message": "更新成功"}

@router.delete("/{product_id}", response_model=dict)
def delete_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="商品不存在")
    return {"code": 200, "message": "删除成功"}