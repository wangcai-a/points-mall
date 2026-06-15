from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.schemas.points import PointsAward, PointsDeduct, PointsImportRecord, PointsImportPreviewResponse
from app.services.points_service import award_points, deduct_points, import_points
from app.utils.excel_utils import parse_excel_file
from app.database import get_db

router = APIRouter(prefix="/api/points", tags=["points"])

@router.post("/award", response_model=dict)
def award_points_endpoint(points_data: PointsAward, db: Session = Depends(get_db)):
    try:
        result = award_points(db, points_data, teacher_id=1)
        return {"code": 200, "message": "积分发放成功", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/deduct", response_model=dict)
def deduct_points_endpoint(points_data: PointsDeduct, db: Session = Depends(get_db)):
    try:
        result = deduct_points(db, points_data, teacher_id=1)
        return {"code": 200, "message": "积分扣除成功", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import", response_model=dict)
async def import_points_preview_endpoint(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        preview = parse_excel_file(file_bytes)
        valid_count = sum(1 for p in preview if p.valid)
        invalid_count = len(preview) - valid_count
        return {"code": 200, "message": "解析成功", "data": {"preview": [p.dict() for p in preview], "valid_count": valid_count, "invalid_count": invalid_count}}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import/confirm", response_model=dict)
def import_points_confirm_endpoint(records: list[PointsImportRecord], db: Session = Depends(get_db)):
    result = import_points(db, records, teacher_id=1)
    return {"code": 200, "message": "导入成功", "data": result}