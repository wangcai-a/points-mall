from sqlalchemy.orm import Session
from datetime import datetime
from app.models import Order, Student, Product, PointsRecord
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderDetailResponse

def get_orders(db: Session, page: int = 1, page_size: int = 10, status: str = None, student_id: int = None):
    query = db.query(Order, Student.name.label('student_name'), Product.name.label('product_name')).\
        join(Student, Order.student_id == Student.id).\
        join(Product, Order.product_id == Product.id)
    
    if status:
        query = query.filter(Order.status == status)
    if student_id:
        query = query.filter(Order.student_id == student_id)
    
    total = query.count()
    records = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "list": [
            OrderResponse(
                id=record[0].id,
                student_id=record[0].student_id,
                student_name=record[1],
                product_id=record[0].product_id,
                product_name=record[2],
                teacher_id=record[0].teacher_id,
                status=record[0].status,
                created_at=record[0].created_at
            )
            for record in records
        ],
        "total": total,
        "page": page,
        "page_size": page_size
    }

def get_order(db: Session, order_id: int) -> Order | None:
    return db.query(Order).filter(Order.id == order_id).first()

def get_order_detail(db: Session, order_id: int) -> dict | None:
    record = db.query(Order, Student, Product).\
        join(Student, Order.student_id == Student.id).\
        join(Product, Order.product_id == Product.id).\
        filter(Order.id == order_id).first()
    
    if record:
        order, student, product = record
        return {
            "id": order.id,
            "student": {
                "id": student.id,
                "name": student.name,
                "class_name": student.class_name
            },
            "product": {
                "id": product.id,
                "name": product.name,
                "price_points": product.price_points
            },
            "status": order.status,
            "created_at": order.created_at,
            "completed_at": order.completed_at
        }
    return None

def create_order(db: Session, order_create: OrderCreate, teacher_id: int) -> dict:
    student = db.query(Student).filter(Student.id == order_create.student_id).first()
    product = db.query(Product).filter(Product.id == order_create.product_id).first()
    
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
        student_id=order_create.student_id,
        teacher_id=teacher_id,
        change_amount=-product.price_points,
        reason=f"兑换商品：{product.name}",
        type="redeem"
    )
    db.add(points_record)
    
    order = Order(
        student_id=order_create.student_id,
        product_id=order_create.product_id,
        teacher_id=teacher_id,
        status="pending"
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return {
        "order_id": order.id,
        "student_name": student.name,
        "student_class": student.class_name,
        "remaining_points": student.total_points,
        "product_name": product.name,
        "cost_points": product.price_points
    }

def update_order(db: Session, order_id: int, order_update: OrderUpdate) -> bool:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return False
    
    old_status = order.status
    order.status = order_update.status
    
    if order_update.status == "completed":
        order.completed_at = datetime.now()
    
    if old_status == "pending" and order_update.status == "cancelled":
        student = db.query(Student).filter(Student.id == order.student_id).first()
        product = db.query(Product).filter(Product.id == order.product_id).first()
        
        if student and product:
            student.total_points += product.price_points
            
            points_record = PointsRecord(
                student_id=order.student_id,
                teacher_id=order.teacher_id,
                change_amount=product.price_points,
                reason=f"取消订单退还积分：{product.name}",
                type="refund"
            )
            db.add(points_record)
            
            product.stock += 1
    
    db.commit()
    return True