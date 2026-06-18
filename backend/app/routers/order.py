from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.schemas.order import OrderCreate, OrderUpdate
from app.services.order_service import get_orders, get_order_detail, update_order
from app.models import Student, Product, PointsRecord, Order
from app.database import get_db
from app.utils.jwt_utils import decode_access_token

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

def get_teacher_id_from_token(request: Request, db: Session):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="未登录")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token无效")
    teacher_id = payload.get("teacher_id")
    if not teacher_id:
        raise HTTPException(status_code=401, detail="教师ID无效")
    return teacher_id

@router.post("", response_model=dict)
def create_order_endpoint(order: OrderCreate, request: Request, db: Session = Depends(get_db)):
    try:
        teacher_id = get_teacher_id_from_token(request, db)
        
        student = db.query(Student).filter(Student.id == order.student_id).first()
        product = db.query(Product).filter(Product.id == order.product_id).first()
        
        if not student:
            raise ValueError("学生不存在")
        if not product:
            raise ValueError("商品不存在")
        if student.total_points < product.price_points:
            raise ValueError(f"积分不足，当前积分：{student.total_points}，所需积分：{product.price_points}")
        if product.stock <= 0:
            raise ValueError("库存不足")
        
        student.total_points -= product.price_points
        product.stock -= 1
        
        points_record = PointsRecord(
            student_id=order.student_id,
            teacher_id=teacher_id,
            change_amount=-product.price_points,
            reason=f"兑换商品：{product.name}",
            type="redeem"
        )
        db.add(points_record)
        
        order_obj = Order(
            student_id=order.student_id,
            product_id=order.product_id,
            teacher_id=teacher_id,
            status="pending"
        )
        db.add(order_obj)
        db.commit()
        db.refresh(order_obj)
        
        return {
            "code": 200,
            "message": "兑换成功",
            "data": {
                "order_id": order_obj.id,
                "student_name": student.name,
                "student_class": student.class_name,
                "remaining_points": student.total_points,
                "product_name": product.name,
                "cost_points": product.price_points
            }
        }
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
