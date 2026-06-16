from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.schemas.auth import TeacherLogin, LoginResponse, TeacherResponse
from app.services.auth_service import login, get_teacher_by_id
from app.utils.jwt_utils import decode_access_token
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=dict)
def login_endpoint(login_data: TeacherLogin, db: Session = Depends(get_db)):
    try:
        result = login(db, login_data)
        return {"code": 200, "message": "登录成功", "data": result.model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=dict)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="未登录")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token无效")
    
    teacher = get_teacher_by_id(db, payload["teacher_id"])
    if not teacher:
        raise HTTPException(status_code=401, detail="教师不存在")
    
    return {"code": 200, "data": TeacherResponse.model_validate(teacher).model_dump()}