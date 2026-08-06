from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import jwt

app = FastAPI()

# Data Models
class AuthUser(BaseModel):
    email: str
    password: str

class GoogleAuth(BaseModel):
    token: str

@app.post("/api/register")
def register(user: AuthUser):
    # TODO: บันทึก user.email และ user.password ลงใน PostgreSQL
    return {"token": f"fake-jwt-{user.email}", "message": "Registered successfully"}

@app.post("/api/login")
def login(user: AuthUser):
    # TODO: ตรวจสอบข้อมูลผู้ใช้ใน PostgreSQL
    return {"token": f"fake-jwt-{user.email}", "message": "Login successful"}

@app.post("/api/google-login")
def google_login(data: GoogleAuth):
    # TODO: ตรวจสอบ Google Token และบันทึก/ค้นหาผู้ใช้ใน DB
    return {"token": "fake-jwt-google-user", "email": "user@gmail.com"}