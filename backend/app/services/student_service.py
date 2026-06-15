from sqlalchemy.orm import Session
from app.models import Student, PointsRecord, Teacher
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, PointsHistoryResponse
from app.database import Base, engine

def get_students(db: Session, page: int = 1, page_size: int = 10, name: str = None, class_name: str = None):
    query = db.query(Student)
    
    if name:
        query = query.filter(Student.name.ilike(f"%{name}%"))
    if class_name:
        query = query.filter(Student.class_name == class_name)
    
    total = query.count()
    students = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "list": [StudentResponse.from_orm(s) for s in students],
        "total": total,
        "page": page,
        "page_size": page_size
    }

def get_student(db: Session, student_id: int) -> Student | None:
    return db.query(Student).filter(Student.id == student_id).first()

def create_student(db: Session, student: StudentCreate) -> Student:
    db_student = Student(
        name=student.name,
        class_name=student.class_name,
        total_points=student.total_points
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student_update: StudentUpdate) -> Student | None:
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if db_student:
        db_student.name = student_update.name
        db_student.class_name = student_update.class_name
        db_student.updated_at = __import__('sqlalchemy').sql.func.current_timestamp()
        db.commit()
        db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int) -> bool:
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    return False

def get_points_history(db: Session, student_id: int, page: int = 1, page_size: int = 10):
    query = db.query(PointsRecord, Teacher.name.label('teacher_name')).\
        join(Teacher, PointsRecord.teacher_id == Teacher.id).\
        filter(PointsRecord.student_id == student_id).\
        order_by(PointsRecord.created_at.desc())
    
    total = query.count()
    records = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "list": [
            PointsHistoryResponse(
                id=record[0].id,
                change_amount=record[0].change_amount,
                reason=record[0].reason,
                type=record[0].type,
                teacher_name=record[1],
                created_at=record[0].created_at
            )
            for record in records
        ],
        "total": total
    }