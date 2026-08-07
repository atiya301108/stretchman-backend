const RENDER_BACKEND_URL = "https://stretchman-backend.onrender.com";
let currentMode = "login"; // 'login' หรือ 'register'

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

// ฟังก์ชันสลับโหมด Sign In / Sign Up
function toggleAuthMode() {
    currentMode = currentMode === "login" ? "register" : "login";
    
    const btnText = document.getElementById("btn-text");
    const switchText = document.getElementById("switch-text");
    const switchLink = document.getElementById("switch-link");

    if (currentMode === "register") {
        btnText.innerText = "Sign Up";
        switchText.innerText = "Already have an account?";
        switchLink.innerText = "Sign In";
    } else {
        btnText.innerText = "Sign In";
        switchText.innerText = "Don't have an account?";
        switchLink.innerText = "Sign Up";
    }
}

// ฟังก์ชันส่งข้อมูล Login/Register ไป Backend
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
            localStorage.setItem("user_token", data.token);
            localStorage.setItem("user_email", email);
            window.location.href = "index.html";
        } else {
            alert(data.detail || data.message || "Authentication failed!");
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
            alert("Google login failed.");
        }
    } catch (err) {
        console.error("Google Auth error:", err);
    }
}