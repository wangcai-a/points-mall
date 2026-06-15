from sqlalchemy.orm import Session
from app.models import Student, PointsRecord
from app.schemas.points import PointsAward, PointsDeduct, PointsImportRecord, PointsImportPreview

def award_points(db: Session, points_data: PointsAward, teacher_id: int) -> dict:
    student = db.query(Student).filter(Student.id == points_data.student_id).first()
    if not student:
        raise ValueError("学生不存在")
    
    student.total_points += points_data.amount
    student.updated_at = __import__('sqlalchemy').sql.func.current_timestamp()
    
    points_record = PointsRecord(
        student_id=points_data.student_id,
        teacher_id=teacher_id,
        change_amount=points_data.amount,
        reason=points_data.reason,
        type="award"
    )
    db.add(points_record)
    db.commit()
    
    return {"student_id": student.id, "total_points": student.total_points}

def deduct_points(db: Session, points_data: PointsDeduct, teacher_id: int) -> dict:
    student = db.query(Student).filter(Student.id == points_data.student_id).first()
    if not student:
        raise ValueError("学生不存在")
    
    if student.total_points < points_data.amount:
        raise ValueError("积分不足，无法扣除")
    
    student.total_points -= points_data.amount
    student.updated_at = __import__('sqlalchemy').sql.func.current_timestamp()
    
    points_record = PointsRecord(
        student_id=points_data.student_id,
        teacher_id=teacher_id,
        change_amount=-points_data.amount,
        reason=points_data.reason,
        type="deduct"
    )
    db.add(points_record)
    db.commit()
    
    return {"student_id": student.id, "total_points": student.total_points}

def import_points(db: Session, records: list[PointsImportRecord], teacher_id: int) -> dict:
    success_count = 0
    fail_count = 0
    
    for record in records:
        try:
            student = db.query(Student).filter(Student.id == record.student_id).first()
            if not student:
                fail_count += 1
                continue
            
            student.total_points += record.change_amount
            student.updated_at = __import__('sqlalchemy').sql.func.current_timestamp()
            
            points_record = PointsRecord(
                student_id=record.student_id,
                teacher_id=teacher_id,
                change_amount=record.change_amount,
                reason=record.reason,
                type="import"
            )
            db.add(points_record)
            success_count += 1
        except Exception:
            fail_count += 1
    
    db.commit()
    return {"success_count": success_count, "fail_count": fail_count}