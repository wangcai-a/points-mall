import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import Student, PointsRecord, Order, LotteryRecord, Product, Teacher

def generate_test_data():
    db = SessionLocal()
    
    teachers = db.query(Teacher).all()
    if not teachers:
        print("No teachers found, creating default teacher...")
        from app.utils.auth_utils import get_password_hash
        teacher = Teacher(username="admin", password_hash=get_password_hash("admin123"), name="管理员")
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
        teacher_id = teacher.id
    else:
        teacher_id = teachers[0].id
    
    products = db.query(Product).all()
    if not products:
        print("No products found, exiting...")
        db.close()
        return
    
    class_names = ["一年级一班", "一年级二班", "二年级一班", "二年级二班", "三年级一班"]
    student_names = [
        "张三", "李四", "王五", "赵六", "孙七", "周八", "吴九", "郑十",
        "小明", "小红", "小刚", "小丽", "小华", "小强", "小芳", "小军",
        "大壮", "阿杰", "阿美", "阿华", "阿强", "阿丽", "阿芳", "阿军",
        "志明", "春娇", "建国", "国庆", "建军", "卫东", "志强", "秀英"
    ]
    
    existing_students = db.query(Student).all()
    existing_names = {s.name for s in existing_students}
    
    new_students = []
    for i, name in enumerate(student_names):
        if name not in existing_names:
            student = Student(
                name=name,
                class_name=class_names[i % len(class_names)],
                total_points=100 + (i % 10) * 50
            )
            new_students.append(student)
    
    if new_students:
        db.add_all(new_students)
        db.commit()
        print(f"Created {len(new_students)} new students")
    else:
        print("All students already exist")
    
    all_students = db.query(Student).all()
    
    for student in all_students:
        record_count = db.query(PointsRecord).filter(PointsRecord.student_id == student.id).count()
        if record_count == 0:
            record = PointsRecord(
                student_id=student.id,
                teacher_id=teacher_id,
                change_amount=student.total_points,
                reason="初始积分",
                type="award"
            )
            db.add(record)
    
    db.commit()
    print("Created points records for students")
    
    order_count = db.query(Order).count()
    if order_count == 0:
        for i, student in enumerate(all_students[:5]):
            if student.total_points >= 50:
                product = products[i % len(products)]
                if product.stock > 0:
                    order = Order(
                        student_id=student.id,
                        product_id=product.id,
                        teacher_id=teacher_id,
                        status="completed"
                    )
                    db.add(order)
                    student.total_points -= product.price_points
                    product.stock -= 1
    
    db.commit()
    print("Created test orders")
    
    lottery_count = db.query(LotteryRecord).count()
    if lottery_count == 0:
        prizes = ["一等奖", "二等奖", "三等奖", "谢谢参与"]
        for i, student in enumerate(all_students[:10]):
            if student.total_points >= 20:
                is_win = (i % 4) < 3
                lottery = LotteryRecord(
                    student_id=student.id,
                    teacher_id=teacher_id,
                    cost_points=20,
                    prize_name=prizes[i % 4] if is_win else None,
                    is_win=is_win
                )
                db.add(lottery)
                student.total_points -= 20
    
    db.commit()
    print("Created test lottery records")
    
    db.close()
    
    print("\nTest data generation complete!")
    print(f"Total students: {len(all_students)}")
    print(f"Total products: {len(products)}")

if __name__ == "__main__":
    generate_test_data()
