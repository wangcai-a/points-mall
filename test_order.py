import sys
sys.path.insert(0, 'd:/code/积分商城/backend')

from app.database import SessionLocal, engine, Base
from app.models import Student, Product, PointsRecord, Order
from app.schemas.order import OrderCreate

Base.metadata.create_all(bind=engine)
db = SessionLocal()

student = db.query(Student).filter(Student.id == 1).first()
product = db.query(Product).filter(Product.stock > 0).first()

print('Student:', student.name, student.class_name, student.total_points)
print('Product:', product.name, product.price_points, product.stock)

order_create = OrderCreate(student_id=99, product_id=product.id)

student.total_points -= product.price_points
product.stock -= 1

points_record = PointsRecord(
    student_id=order_create.student_id,
    teacher_id=1,
    change_amount=-product.price_points,
    reason=f'兑换商品：{product.name}',
    type='redeem'
)
db.add(points_record)

order_obj = Order(
    student_id=order_create.student_id,
    product_id=order_create.product_id,
    teacher_id=1,
    status='pending'
)
db.add(order_obj)
db.commit()
db.refresh(order_obj)

result = {
    'order_id': order_obj.id,
    'student_name': student.name,
    'student_class': student.class_name,
    'remaining_points': student.total_points,
    'product_name': product.name,
    'cost_points': product.price_points
}

print('Result:', result)
db.close()
