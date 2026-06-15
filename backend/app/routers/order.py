from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.order import OrderCreate, OrderUpdate
from app.services.order_service import get_orders, get_order_detail, create_order, update_order
from app.database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("", response_model=dict)
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    student_id: int = Query(None),
    db: Session = Depends(get_db)
):
    result = get_orders(db, page, page_size, status, student_id)
    return {"code": 200, "data": result}

@router.post("", response_model=dict)
def create_order_endpoint(order: OrderCreate, db: Session = Depends(get_db)):
    try:
        result = create_order(db, order, teacher_id=1)
        return {"code": 200, "message": "兑换成功", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{order_id}", response_model=dict)
def get_order_endpoint(order_id: int, db: Session = Depends(get_db)):
    order = get_order_detail(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    return {"code": 200, "data": order}

@router.put("/{order_id}", response_model=dict)
def update_order_endpoint(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    success = update_order(db, order_id, order_update)
    if not success:
        raise HTTPException(status_code=404, detail="订单不存在")
    return {"code": 200, "message": "更新成功"}