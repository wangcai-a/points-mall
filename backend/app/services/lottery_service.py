from sqlalchemy.orm import Session
import random
from app.models import Student, LotteryRecord, PointsRecord, Product
from app.schemas.lottery import LotteryDraw, LotteryDrawResponse, LotteryRecordResponse

PRIZES = [
    {"id": 1, "name": "笔记本", "probability": 0.3, "price_points": 50},
    {"id": 2, "name": "钢笔", "probability": 0.2, "price_points": 100},
    {"id": 3, "name": "文具盒", "probability": 0.15, "price_points": 80},
    {"id": 4, "name": "书签", "probability": 0.2, "price_points": 40},
    {"id": 5, "name": "卡通贴纸", "probability": 0.1, "price_points": 30},
    {"id": 6, "name": "谢谢参与", "probability": 0.05, "price_points": 0}
]

def get_prizes(db: Session):
    return PRIZES

def draw_lottery(db: Session, draw_data: LotteryDraw, teacher_id: int) -> LotteryDrawResponse:
    student = db.query(Student).filter(Student.id == draw_data.student_id).first()
    if not student:
        raise ValueError("学生不存在")
    
    if student.total_points < draw_data.cost_points:
        raise ValueError("积分不足")
    
    student.total_points -= draw_data.cost_points
    
    points_record = PointsRecord(
        student_id=draw_data.student_id,
        teacher_id=teacher_id,
        change_amount=-draw_data.cost_points,
        reason=f"抽奖消耗",
        type="lottery"
    )
    db.add(points_record)
    
    random_num = random.random()
    cumulative_prob = 0
    prize = None
    
    for p in PRIZES:
        cumulative_prob += p["probability"]
        if random_num <= cumulative_prob:
            prize = p
            break
    
    is_win = prize["name"] != "谢谢参与"
    
    if is_win:
        student.total_points += prize["price_points"]
    
    lottery_record = LotteryRecord(
        student_id=draw_data.student_id,
        teacher_id=teacher_id,
        cost_points=draw_data.cost_points,
        prize_name=prize["name"] if is_win else None,
        is_win=is_win
    )
    db.add(lottery_record)
    db.commit()
    
    return LotteryDrawResponse(
        prize_name=prize["name"] if is_win else None,
        is_win=is_win,
        remaining_points=student.total_points
    )

def get_lottery_records(db: Session, page: int = 1, page_size: int = 10, student_id: int = None):
    from app.models import Teacher
    query = db.query(LotteryRecord, Student.name.label('student_name'), Teacher.name.label('teacher_name')).\
        join(Student, LotteryRecord.student_id == Student.id).\
        join(Teacher, LotteryRecord.teacher_id == Teacher.id)
    
    if student_id:
        query = query.filter(LotteryRecord.student_id == student_id)
    
    total = query.count()
    records = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "list": [
            LotteryRecordResponse(
                id=record[0].id,
                student_name=record[1],
                cost_points=record[0].cost_points,
                prize_name=record[0].prize_name,
                is_win=record[0].is_win,
                teacher_name=record[2],
                created_at=record[0].created_at
            )
            for record in records
        ],
        "total": total
    }