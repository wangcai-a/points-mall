import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

SQLALCHEMY_DATABASE_URL = settings.database_url

_db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
_db_dir = os.path.dirname(_db_path)
if _db_dir:
    os.makedirs(_db_dir, exist_ok=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()