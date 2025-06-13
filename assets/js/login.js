// Mock Login with JWT (รอเชื่อม API จริงในอนาคต)
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // กรณีต้องเชื่อม API จริงให้แทนที่ตรงนี้
  if (username === "demo" && password === "1234") {
    // สมมุติ JWT ที่ได้รับมา
    const jwtToken = "your.jwt.token";
    localStorage.setItem("jwt_token", jwtToken);
    window.location = "index.html"; // ไปหน้าหลัก
  } else {
    document.getElementById("loginError").textContent =
      "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    document.getElementById("loginError").classList.remove("d-none");
  }
});

// ปุ่มลงทะเบียน
document.getElementById("registerBtn").addEventListener("click", function () {
  // ไปหน้าลงทะเบียน (register.html)
  window.location = "/register.html";
});
