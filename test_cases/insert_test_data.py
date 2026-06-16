import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.database import SessionLocal, Base, engine
from app.models import Teacher, Student, Product, PointsRecord, Order, LotteryRecord
from app.utils.jwt_utils import get_password_hash


def clear_all_data(db):
    db.query(LotteryRecord).delete()
    db.query(Order).delete()
    db.query(PointsRecord).delete()
    db.query(Product).delete()
    db.query(Student).delete()
    db.query(Teacher).delete()
    db.commit()
    print("Cleared all existing data")


def insert_teachers(db):
    teachers = [
        Teacher(username="admin", password_hash=get_password_hash("admin123"), name="管理员"),
        Teacher(username="teacher001", password_hash=get_password_hash("teacher123"), name="张老师"),
        Teacher(username="teacher002", password_hash=get_password_hash("teacher123"), name="李老师"),
    ]
    db.add_all(teachers)
    db.commit()
    for t in teachers:
        db.refresh(t)
    print(f"Inserted {len(teachers)} teachers")
    return teachers


def insert_products(db):
    products = [
        Product(name="笔记本", description="精美笔记本，适合学习记录", price_points=50, stock=50, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=notebook%20stationery%20product%20photo&image_size=square", category="学习用品"),
        Product(name="铅笔套装", description="12色铅笔套装，色彩鲜艳", price_points=30, stock=100, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=color%20pencils%20set%20stationery%20product%20photo&image_size=square", category="学习用品"),
        Product(name="橡皮", description="柔软橡皮擦，不留痕迹", price_points=10, stock=200, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=eraser%20stationery%20product%20photo&image_size=square", category="学习用品"),
        Product(name="尺子", description="多功能直尺套装", price_points=20, stock=80, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=ruler%20set%20stationery%20product%20photo&image_size=square", category="学习用品"),
        Product(name="文具盒", description="卡通图案文具盒", price_points=80, stock=30, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=pencil%20case%20cartoon%20stationery%20product%20photo&image_size=square", category="学习用品"),
        Product(name="书包", description="轻便双肩书包", price_points=200, stock=20, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=backpack%20school%20bag%20product%20photo&image_size=square", category="生活用品"),
        Product(name="水杯", description="不锈钢保温杯", price_points=150, stock=40, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=stainless%20steel%20water%20bottle%20product%20photo&image_size=square", category="生活用品"),
        Product(name="跳绳", description="儿童跳绳", price_points=40, stock=60, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=jump%20rope%20sports%20product%20photo&image_size=square", category="体育用品"),
        Product(name="篮球", description="儿童篮球", price_points=100, stock=25, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=children%20basketball%20sports%20product%20photo&image_size=square", category="体育用品"),
        Product(name="故事书", description="精选童话故事书", price_points=60, stock=70, image_url="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=children%20story%20book%20product%20photo&image_size=square", category="图书"),
    ]
    db.add_all(products)
    db.commit()
    for p in products:
        db.refresh(p)
    print(f"Inserted {len(products)} products")
    return products


def insert_students(db):
    class_names = ["一年级一班", "一年级二班", "二年级一班", "二年级二班", "三年级一班", "三年级二班"]
    student_names = [
        "张三", "李四", "王五", "赵六", "孙七", "周八", "吴九", "郑十",
        "小明", "小红", "小刚", "小丽", "小华", "小强", "小芳", "小军",
        "大壮", "阿杰", "阿美", "阿华", "阿强", "阿丽", "阿芳", "阿军",
        "志明", "春娇", "建国", "国庆", "建军", "卫东", "志强", "秀英",
        "博文", "雨萱", "梓涵", "欣怡", "浩宇", "一诺", "天佑", "思涵",
        "子轩", "梦瑶", "俊豪", "佳怡", "浩轩", "诗涵", "宇航", "若曦",
    ]
    
    students = []
    for i, name in enumerate(student_names):
        student = Student(
            name=name,
            class_name=class_names[i % len(class_names)],
            total_points=50 + (i % 10) * 30
        )
        students.append(student)
    
    db.add_all(students)
    db.commit()
    for s in students:
        db.refresh(s)
    print(f"Inserted {len(students)} students")
    return students


def insert_points_records(db, students, teachers):
    records = []
    teacher_id = teachers[0].id
    
    for student in students:
        records.append(PointsRecord(
            student_id=student.id,
            teacher_id=teacher_id,
            change_amount=student.total_points,
            reason="初始积分",
            type="award"
        ))
    
    for i, student in enumerate(students[:15]):
        records.append(PointsRecord(
            student_id=student.id,
            teacher_id=teachers[i % len(teachers)].id,
            change_amount=20,
            reason="课堂表现优秀",
            type="award"
        ))
        student.total_points += 20
    
    for i, student in enumerate(students[5:20]):
        records.append(PointsRecord(
            student_id=student.id,
            teacher_id=teachers[i % len(teachers)].id,
            change_amount=-10,
            reason="作业未完成",
            type="deduct"
        ))
        student.total_points -= 10
    
    db.add_all(records)
    db.commit()
    print(f"Inserted {len(records)} points records")


def insert_orders(db, students, products, teachers):
    orders = []
    teacher_id = teachers[0].id
    
    for i, student in enumerate(students[:8]):
        product = products[i % len(products)]
        if student.total_points >= product.price_points and product.stock > 0:
            orders.append(Order(
                student_id=student.id,
                product_id=product.id,
                teacher_id=teacher_id,
                status="completed"
            ))
            student.total_points -= product.price_points
            product.stock -= 1
    
    for i, student in enumerate(students[8:15]):
        product = products[(i + 5) % len(products)]
        if student.total_points >= product.price_points:
            orders.append(Order(
                student_id=student.id,
                product_id=product.id,
                teacher_id=teacher_id,
                status="pending"
            ))
    
    db.add_all(orders)
    db.commit()
    print(f"Inserted {len(orders)} orders")


def insert_lottery_records(db, students, teachers):
    records = []
    teacher_id = teachers[0].id
    prizes = ["一等奖", "二等奖", "三等奖", "谢谢参与"]
    
    for i, student in enumerate(students[:15]):
        if student.total_points >= 20:
            is_win = (i % 4) < 3
            records.append(LotteryRecord(
                student_id=student.id,
                teacher_id=teacher_id,
                cost_points=20,
                prize_name=prizes[i % 4] if is_win else None,
                is_win=is_win
            ))
            student.total_points -= 20
    
    db.add_all(records)
    db.commit()
    print(f"Inserted {len(records)} lottery records")


def main():
    print("=" * 50)
    print("Starting test data insertion...")
    print("=" * 50)
    
    db = SessionLocal()
    
    print("\n1. Clearing existing data...")
    clear_all_data(db)
    
    print("\n2. Inserting teachers...")
    teachers = insert_teachers(db)
    
    print("\n3. Inserting products...")
    products = insert_products(db)
    
    print("\n4. Inserting students...")
    students = insert_students(db)
    
    print("\n5. Inserting points records...")
    insert_points_records(db, students, teachers)
    
    print("\n6. Inserting orders...")
    insert_orders(db, students, products, teachers)
    
    print("\n7. Inserting lottery records...")
    insert_lottery_records(db, students, teachers)
    
    db.close()
    
    print("\n" + "=" * 50)
    print("Test data insertion complete!")
    print("=" * 50)
    print(f"Teachers: {len(teachers)}")
    print(f"Products: {len(products)}")
    print(f"Students: {len(students)}")


if __name__ == "__main__":
    main()