const RENDER_BACKEND_URL = "https://stretchman-backend.onrender.com";

// ตรวจสอบว่าเคยเข้าสู่ระบบไว้แล้วหรือไม่
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("user_token");
    if (token) {
        window.location.href = "index.html";
    }
});

// จัดการการกดปุ่ม Create Account
async function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById("fullname").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const terms = document.getElementById("terms").checked;

    // 1. ตรวจสอบรหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // 2. ตรวจสอบการยินยอมเงื่อนไข
    if (!terms) {
        alert("Please agree to the Terms of Service and Privacy Policy.");
        return;
    }

    try {
        const response = await fetch(`${RENDER_BACKEND_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem("user_token", data.token);
            localStorage.setItem("user_email", email);
            window.location.href = "index.html";
        } else {
            alert(data.detail || data.message || "Registration failed!");
        }
    } catch (err) {
        console.error("Register error:", err);
        alert("Cannot connect to server.");
    }
}

// Callback สำหรับ Google Sign-Up / Log-In
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
            alert("Google Sign-In failed.");
        }
    } catch (err) {
        console.error("Google Auth error:", err);
    }
}