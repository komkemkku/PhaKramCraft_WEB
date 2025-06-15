document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const jwtToken = data.token;
        const user = data.user;

        // เก็บ token และข้อมูลผู้ใช้ใน localStorage
        localStorage.setItem("jwt_token", jwtToken);
        localStorage.setItem("user", JSON.stringify(user));

        // ไปหน้าหลัก
        window.location = "index.html";
      } else {
        const error = await response.json();
        document.getElementById("loginError").textContent =
          error.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        document.getElementById("loginError").classList.remove("d-none");
      }
    } catch (err) {
      console.error("Login error:", err);
      document.getElementById("loginError").textContent =
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      document.getElementById("loginError").classList.remove("d-none");
    }
  });

// ปุ่มลงทะเบียน
document.getElementById("registerBtn").addEventListener("click", function () {
  window.location = "/register.html";
});
