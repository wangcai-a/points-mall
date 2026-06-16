from sqlalchemy.orm import Session
from datetime import timedelta
from app.models import Teacher
from app.schemas.auth import TeacherLogin, TeacherResponse, LoginResponse
from app.utils.jwt_utils import verify_password, create_access_token
from app.config import settings

def authenticate_teacher(db: Session, username: str, password: str) -> Teacher | None:
    teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if teacher and verify_password(password, teacher.password_hash):
        return teacher
    return None

def login(db: Session, login_data: TeacherLogin) -> LoginResponse:
    teacher = authenticate_teacher(db, login_data.username, login_data.password)
    if not teacher:
        raise ValueError("用户名或密码错误")
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"teacher_id": teacher.id, "username": teacher.username, "name": teacher.name},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        token=access_token,
        teacher=TeacherResponse.model_validate(teacher)
    )

def get_teacher_by_id(db: Session, teacher_id: int) -> Teacher | None:
    return db.query(Teacher).filter(Teacher.id == teacher_id).first()