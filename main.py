from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/")
def read_root():
    return {"status": "Server is running!"}

@app.post("/api/login")
def login(data: LoginRequest):
    # ตัวอย่างตรวจสอบการ Login
    if data.email == "test@user.com" and data.password == "123456":
        return {"success": True, "message": "Login สำเร็จ", "token": "fake-jwt-token"}
    return {"success": False, "message": "Email หรือ Password ไม่ถูกต้อง"}