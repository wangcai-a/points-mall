from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.lottery import LotteryDraw
from app.services.lottery_service import get_prizes, draw_lottery, get_lottery_records
from app.database import get_db

router = APIRouter(prefix="/api/lottery", tags=["lottery"])

@router.get("/prizes", response_model=dict)
def list_prizes(db: Session = Depends(get_db)):
    prizes = get_prizes(db)
    return {"code": 200, "data": prizes}

@router.post("/draw", response_model=dict)
def draw_lottery_endpoint(draw_data: LotteryDraw, db: Session = Depends(get_db)):
    try:
        result = draw_lottery(db, draw_data, teacher_id=1)
        message = "恭喜中奖！" if result.is_win else "很遗憾，未中奖"
        return {"code": 200, "message": message, "data": result.dict()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/records", response_model=dict)
def list_lottery_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    student_id: int = Query(None),
    db: Session = Depends(get_db)
):
    result = get_lottery_records(db, page, page_size, student_id)
    return {"code": 200, "data": result}