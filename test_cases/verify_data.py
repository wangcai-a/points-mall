import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.database import SessionLocal
from app.models import Teacher, Student, Product, PointsRecord, Order, LotteryRecord

db = SessionLocal()

print("=== Data Verification ===")
print(f"Teachers: {db.query(Teacher).count()}")
print(f"Students: {db.query(Student).count()}")
print(f"Products: {db.query(Product).count()}")
print(f"Points Records: {db.query(PointsRecord).count()}")
print(f"Orders: {db.query(Order).count()}")
print(f"Lottery Records: {db.query(LotteryRecord).count()}")

print("\n=== Teacher List ===")
for t in db.query(Teacher).all():
    print(f"  {t.id}: {t.name} ({t.username})")

print("\n=== Product Categories ===")
categories = db.query(Product.category).distinct().all()
for cat in categories:
    count = db.query(Product).filter(Product.category == cat[0]).count()
    print(f"  {cat[0]}: {count} products")

print("\n=== Top 5 Students by Points ===")
students = db.query(Student).order_by(Student.total_points.desc()).limit(5).all()
for s in students:
    print(f"  {s.name} ({s.class_name}): {s.total_points} points")

db.close()