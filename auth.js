const RENDER_BACKEND_URL = "https://stretchman-backend.onrender.com"; // URL บน Render ของคุณ
let currentMode = "login";

// 1. ตรวจสอบว่าเคยเข้าสู่ระบบไว้แล้วหรือไม่ (จดจำการเข้าสู่ระบบ)
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("user_token");
    if (token) {
        // หากมี Token อยู่แล้ว ให้เปลี่ยนไปหน้า Dashboard
        window.location.href = "index.html";
    }
});

// สลับโหมด ล็อกอิน / สมัครสมาชิก
function switchTab(mode) {
    currentMode = mode;
    document.getElementById("tab-login").classList.toggle("active", mode === "login");
    document.getElementById("tab-register").classList.toggle("active", mode === "register");
    document.getElementById("btn-submit").innerText = mode === "login" ? "Log In" : "Create Account";
}

// 2. จัดการส่งข้อมูล Login / Register
async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const endpoint = currentMode === "login" ? "/api/login" : "/api/register";

    try {
        const response = await fetch(`${RENDER_BACKEND_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // บันทึก Token ลงใน Browser เพื่อจดจำการเข้าสู่ระบบ
            localStorage.setItem("user_token", data.token);
            localStorage.setItem("user_email", email);
            window.location.href = "index.html";
        } else {
            alert(data.message || "Authentication failed!");
        }
    } catch (err) {
        console.error("Auth error:", err);
        alert("Cannot connect to server.");
    }
}

// 3. จัดการ Callback จาก Google Sign-In
async function handleGoogleLogin(response) {
    const googleToken = response.credential;

    try {
        const res = await fetch(`${RENDER_BACKEND_URL}/api/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: googleToken })
        });

        const data = await res.json();

        if (res.ok && data.token) {
            localStorage.setItem("user_token", data.token);
            localStorage.setItem("user_email", data.email);
            window.location.href = "index.html";
        } else {
            alert("Google login failed.");
        }
    } catch (err) {
        console.error("Google Auth error:", err);
    }
}