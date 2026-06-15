from pydantic import BaseModel
from datetime import datetime

class LotteryDraw(BaseModel):
    student_id: int
    cost_points: int

class PrizeResponse(BaseModel):
    id: int
    name: str
    probability: float
    stock: int

class LotteryDrawResponse(BaseModel):
    prize_name: str | None
    is_win: bool
    remaining_points: int

class LotteryRecordResponse(BaseModel):
    id: int
    student_name: str
    cost_points: int
    prize_name: str | None
    is_win: bool
    teacher_name: str
    created_at: datetime

class LotteryRecordListResponse(BaseModel):
    list: list[LotteryRecordResponse]
    total: int