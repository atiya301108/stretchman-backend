const RENDER_BACKEND_URL = "https://stretchman-backend.onrender.com";

// เช็กว่ามี Token อยู่แล้วหรือไม่ ถ้ามีให้พาเข้าหน้า Dashboard ทันที
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("user_token");
    if (token) {
        window.location.href = "index.html";
    }
});

async function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById("fullname").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const terms = document.getElementById("terms").checked;

    if (password !== confirmPassword) {
        alert("รหัสผ่านทั้งสองช่องไม่ตรงกัน!");
        return;
    }

    if (!terms) {
        alert("กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก");
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
            alert("สมัครสมาชิกสำเร็จ!");
            // บันทึกข้อมูลลง localStorage เพื่อนำไปแสดงในหน้า Dashboard
            localStorage.setItem("user_token", data.token);
            localStorage.setItem("user_email", email);
            localStorage.setItem("user_name", fullName);
            
            // เปลี่ยนหน้าไปยัง Dashboard
            window.location.href = "index.html";
        } else {
            alert(data.detail || "การสมัครสมาชิกมีความผิดพลาด");
        }
    } catch (err) {
        console.error("Register error:", err);
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
}

// Google Sign-Up / Log-In Callback
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
            if (data.full_name) {
                localStorage.setItem("user_name", data.full_name);
            }
            window.location.href = "index.html";
        } else {
            alert("Google Sign-In ล้มเหลว");
        }
    } catch (err) {
        console.error("Google Auth error:", err);
    }
}