import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import auth, student, product, order, points, lottery, upload
from app.utils.jwt_utils import get_password_hash

app = FastAPI(title="学生积分商城", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(student.router)
app.include_router(product.router)
app.include_router(order.router)
app.include_router(points.router)
app.include_router(lottery.router)
app.include_router(upload.router)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    init_default_data()

def init_default_data():
    from app.database import SessionLocal
    from app.models import Teacher, Product
    
    db = SessionLocal()
    
    if not db.query(Teacher).filter(Teacher.username == "admin").first():
        admin = Teacher(
            username="admin",
            password_hash=get_password_hash("admin123"),
            name="管理员"
        )
        db.add(admin)
    
    default_products = [
        {"name": "笔记本", "description": "精美笔记本一本", "price_points": 50, "stock": 100, "category": "学习用品", "image_url": "https://picsum.photos/seed/notebook/400/400"},
        {"name": "钢笔", "description": "高档钢笔一支", "price_points": 100, "stock": 50, "category": "学习用品", "image_url": "https://picsum.photos/seed/pen/400/400"},
        {"name": "书包", "description": "时尚双肩书包", "price_points": 300, "stock": 30, "category": "学习用品", "image_url": "https://picsum.photos/seed/bag/400/400"},
        {"name": "文具盒", "description": "多功能文具盒", "price_points": 80, "stock": 80, "category": "学习用品", "image_url": "https://picsum.photos/seed/pencilcase/400/400"},
        {"name": "运动水杯", "description": "大容量运动水杯", "price_points": 120, "stock": 40, "category": "生活用品", "image_url": "https://picsum.photos/seed/bottle/400/400"},
        {"name": "卡通贴纸", "description": "可爱卡通贴纸套装", "price_points": 30, "stock": 200, "category": "生活用品", "image_url": "https://picsum.photos/seed/stickers/400/400"},
        {"name": "书签", "description": "精美书签套装", "price_points": 40, "stock": 150, "category": "生活用品", "image_url": "https://picsum.photos/seed/bookmark/400/400"},
        {"name": "奖状", "description": "荣誉奖状一张", "price_points": 20, "stock": 500, "category": "荣誉奖品", "image_url": "https://picsum.photos/seed/certificate/400/400"},
    ]
    
    for product_data in default_products:
        existing_product = db.query(Product).filter(Product.name == product_data["name"]).first()
        if existing_product:
            existing_product.image_url = product_data["image_url"]
        else:
            product = Product(**product_data)
            db.add(product)
    
    db.commit()
    db.close()

@app.get("/")
def root():
    return {"message": "学生积分商城 API"}