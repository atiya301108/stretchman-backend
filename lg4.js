// ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่ ก่อนแสดงหน้า Dashboard
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("user_token");
    if (!token) {
        // ถ้าไม่มี Token ให้เด้งกลับไปหน้า ล็อกอิน
        window.location.href = "login.html";
    }
});

// ฟังก์ชันสำหรับ Log Out
function logout() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_email");
    window.location.href = "login.html";
}