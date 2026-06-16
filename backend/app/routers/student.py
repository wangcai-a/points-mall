from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentImportPreview
from app.services.student_service import get_students, get_student, get_class_list, create_student, update_student, delete_student, get_points_history, parse_student_excel, import_students
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

@router.get("/classes", response_model=dict)
def list_classes(db: Session = Depends(get_db)):
    classes = get_class_list(db)
    return {"code": 200, "data": classes}

@router.post("", response_model=dict)
def create_student_endpoint(student: StudentCreate, db: Session = Depends(get_db)):
    result = create_student(db, student)
    return {"code": 200, "message": "创建成功", "data": StudentResponse.model_validate(result).model_dump()}

@router.get("/{student_id}", response_model=dict)
def get_student_endpoint(student_id: int, db: Session = Depends(get_db)):
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="学生不存在")
    return {"code": 200, "data": StudentResponse.model_validate(student).model_dump()}

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

@router.post("/import/preview", response_model=dict)
async def import_student_preview(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="请上传Excel文件（.xlsx或.xls格式）")
    
    try:
        file_bytes = await file.read()
        preview_data = parse_student_excel(file_bytes)
        valid_count = sum(1 for item in preview_data if item.valid)
        invalid_count = len(preview_data) - valid_count
        
        return {
            "code": 200,
            "data": {
                "preview": [item.model_dump() for item in preview_data],
                "valid_count": valid_count,
                "invalid_count": invalid_count
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import", response_model=dict)
def import_student_confirm(students_data: list[dict], db: Session = Depends(get_db)):
    if not students_data:
        raise HTTPException(status_code=400, detail="没有可导入的数据")
    
    result = import_students(db, students_data)
    return {"code": 200, "data": result.model_dump()}