import os
import jwt
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "stretchman-secret-key-2026-safe")
ALGORITHM = "HS256"

# 1. เชื่อมต่อ PostgreSQL บน Render
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. ปรับโครงสร้างตาราง users ให้เก็บ full_name
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)  # เพิ่มเก็บชื่อ-นามสกุล
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    auth_provider = Column(String, default="email")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="StretchMan Authentication API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schemas
class RegisterSchema(BaseModel):
    full_name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class GoogleAuthSchema(BaseModel):
    token: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- ENDPOINTS ---

# 1. สมัครสมาชิก (บันทึกข้อมูลเข้า Render)
@app.post("/api/register")
def register(user: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบ"
        )

    hashed_password = pwd_context.hash(user.password)
    new_user = UserDB(
        full_name=user.full_name,
        email=user.email,
        password_hash=hashed_password,
        auth_provider="email"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "id": new_user.id})
    return {"token": token, "email": new_user.email, "message": "สมัครสมาชิกสำเร็จ"}

# 2. เข้าสู่ระบบ (เช็กว่าสมัครแล้วหรือยัง)
@app.post("/api/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    
    # หากยังไม่เคยสมัครสมาชิก
    if not db_user:
        raise HTTPException(
            status_code=404, 
            detail="ไม่พบบัญชีนี้ในระบบ กรุณาไปที่หน้าสมัครสมาชิกก่อน"
        )

    # หากสมัครผ่าน Google แต่พยายามกรอกรหัสผ่านปกติ
    if not db_user.password_hash:
        raise HTTPException(
            status_code=400, 
            detail="บัญชีนี้สมัครไว้ผ่าน Google กรุณากดล็อกอินด้วย Google"
        )

    # ตรวจสอบรหัสผ่าน
    if not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=400, 
            detail="รหัสผ่านไม่ถูกต้อง"
        )

    token = create_access_token({"sub": db_user.email, "id": db_user.id})
    return {"token": token, "email": db_user.email, "message": "เข้าสู่ระบบสำเร็จ"}

# 3. ล็อกอินผ่าน Google
@app.post("/api/google-login")
def google_login(data: GoogleAuthSchema, db: Session = Depends(get_db)):
    google_res = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={data.token}")
    if google_res.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Google Token")

    google_data = google_res.json()
    email = google_data.get("email")
    name = google_data.get("name", "")

    if not email:
        raise HTTPException(status_code=400, detail="ไม่พบข้อมูลอีเมลจาก Google")

    db_user = db.query(UserDB).filter(UserDB.email == email).first()
    if not db_user:
        db_user = UserDB(
            full_name=name,
            email=email,
            password_hash=None,
            auth_provider="google"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    token = create_access_token({"sub": db_user.email, "id": db_user.id})
    return {"token": token, "email": db_user.email, "message": "Google Login successful"}