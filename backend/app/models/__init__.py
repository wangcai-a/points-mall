from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    class_name = Column(String(50), nullable=False)
    total_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp())

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String)
    price_points = Column(Integer, nullable=False)
    stock = Column(Integer, default=0)
    image_url = Column(String(255))
    category = Column(String(50))
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp())

class PointsRecord(Base):
    __tablename__ = "points_records"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    change_amount = Column(Integer, nullable=False)
    reason = Column(String(255))
    type = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=func.current_timestamp())
    completed_at = Column(DateTime)

class LotteryRecord(Base):
    __tablename__ = "lottery_records"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    cost_points = Column(Integer, nullable=False)
    prize_name = Column(String(100))
    is_win = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.current_timestamp())