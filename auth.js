const RENDER_BACKEND_URL = "https://stretchman-backend.onrender.com";

// ตรวจสอบว่าเคยเข้าสู่ระบบไว้แล้วหรือไม่ ถ้ามี Token ให้ข้ามไปหน้า index.html
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("user_token");
    if (token) {
        window.location.href = "index.html";
    }
});

// ฟังก์ชันสลับการมองเห็นรหัสผ่าน (ซ่อน/แสดง)
function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("togglePassword");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
    }
}

// ฟังก์ชันส่งข้อมูล ล็อกอิน ไปยัง Backend
async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${RENDER_BACKEND_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem("user_token", data.token);
            localStorage.setItem("user_email", email);
            window.location.href = "index.html";
        } else {
            // เด้ง Alert ข้อความแจ้งเตือนจาก Backend (เช่น ไม่พบบัญชีนี้ในระบบ กรุณาไปสมัครสมาชิกก่อน)
            alert(data.detail || data.message || "Login failed!");
        }
    } catch (err) {
        console.error("Auth error:", err);
        alert("Cannot connect to server.");
    }
}

// Callback จาก Google Sign-In
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
            alert(data.detail || "Google login failed.");
        }
    } catch (err) {
        console.error("Google Auth error:", err);
        alert("Cannot connect to Google Auth server.");
    }
}