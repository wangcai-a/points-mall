from pydantic import BaseModel, ConfigDict

class TeacherLogin(BaseModel):
    username: str
    password: str

class TeacherResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    name: str

class LoginResponse(BaseModel):
    token: str
    teacher: TeacherResponse