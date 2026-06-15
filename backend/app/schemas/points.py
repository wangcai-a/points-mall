from pydantic import BaseModel

class PointsAward(BaseModel):
    student_id: int
    amount: int
    reason: str

class PointsDeduct(BaseModel):
    student_id: int
    amount: int
    reason: str

class PointsAwardResponse(BaseModel):
    student_id: int
    total_points: int

class PointsImportRecord(BaseModel):
    student_id: int
    change_amount: int
    reason: str

class PointsImportPreview(BaseModel):
    row: int
    student_id: int | None
    name: str
    class_name: str
    change_amount: int
    reason: str
    valid: bool
    error: str | None = None

class PointsImportPreviewResponse(BaseModel):
    preview: list[PointsImportPreview]
    valid_count: int
    invalid_count: int

class PointsImportConfirmResponse(BaseModel):
    success_count: int
    fail_count: int