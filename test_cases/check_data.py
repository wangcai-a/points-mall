import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.database import SessionLocal
from app.models import Teacher, Student, Product, PointsRecord, Order, LotteryRecord

db = SessionLocal()

output = []
output.append("=== Data Verification ===")
output.append(f"Teachers: {db.query(Teacher).count()}")
output.append(f"Students: {db.query(Student).count()}")
output.append(f"Products: {db.query(Product).count()}")
output.append(f"Points Records: {db.query(PointsRecord).count()}")
output.append(f"Orders: {db.query(Order).count()}")
output.append(f"Lottery Records: {db.query(LotteryRecord).count()}")

output.append("\n=== Teacher List ===")
for t in db.query(Teacher).all():
    output.append(f"  {t.id}: {t.name} ({t.username})")

output.append("\n=== Product Categories ===")
categories = db.query(Product.category).distinct().all()
for cat in categories:
    count = db.query(Product).filter(Product.category == cat[0]).count()
    output.append(f"  {cat[0]}: {count} products")

output.append("\n=== Top 5 Students by Points ===")
students = db.query(Student).order_by(Student.total_points.desc()).limit(5).all()
for s in students:
    output.append(f"  {s.name} ({s.class_name}): {s.total_points} points")

db.close()

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_report.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(output))

print("Report written to data_report.txt")