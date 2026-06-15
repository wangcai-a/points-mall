from pydantic import BaseModel

class TeacherLogin(BaseModel):
    username: str
    password: str

class TeacherResponse(BaseModel):
    id: int
    username: str
    name: str

    class Config:
        orm_mode = True

class LoginResponse(BaseModel):
    token: str
    teacher: TeacherResponse