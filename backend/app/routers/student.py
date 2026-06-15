from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.services.student_service import get_students, get_student, create_student, update_student, delete_student, get_points_history
from app.database import get_db

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("", response_model=dict)
def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    name: str = Query(None),
    class_name: str = Query(None),
    db: Session = Depends(get_db)
):
    result = get_students(db, page, page_size, name, class_name)
    return {"code": 200, "data": result}

@router.post("", response_model=dict)
def create_student_endpoint(student: StudentCreate, db: Session = Depends(get_db)):
    result = create_student(db, student)
    return {"code": 200, "message": "创建成功", "data": StudentResponse.from_orm(result).dict()}

@router.get("/{student_id}", response_model=dict)
def get_student_endpoint(student_id: int, db: Session = Depends(get_db)):
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="学生不存在")
    return {"code": 200, "data": StudentResponse.from_orm(student).dict()}

@router.put("/{student_id}", response_model=dict)
def update_student_endpoint(student_id: int, student_update: StudentUpdate, db: Session = Depends(get_db)):
    student = update_student(db, student_id, student_update)
    if not student:
        raise HTTPException(status_code=404, detail="学生不存在")
    return {"code": 200, "message": "更新成功"}

@router.delete("/{student_id}", response_model=dict)
def delete_student_endpoint(student_id: int, db: Session = Depends(get_db)):
    success = delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="学生不存在")
    return {"code": 200, "message": "删除成功"}

@router.get("/{student_id}/points-history", response_model=dict)
def get_points_history_endpoint(
    student_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    if not get_student(db, student_id):
        raise HTTPException(status_code=404, detail="学生不存在")
    result = get_points_history(db, student_id, page, page_size)
    return {"code": 200, "data": result}