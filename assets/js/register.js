document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstname = document.getElementById("firstName").value.trim();
    const lastname = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const errorMsg = document.getElementById("registerError");

    // ตรวจสอบรหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      errorMsg.textContent = "รหัสผ่านไม่ตรงกัน";
      errorMsg.classList.remove("d-none");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          phone,
          username,
          password,
        }),
      });

      if (response.ok) {
        // Toast แจ้งเตือนความสำเร็จ (Bootstrap 5)
        const toastEl = document.getElementById("registerToast");
        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        setTimeout(() => {
          window.location = "login.html";
        }, 1800); // 1.8 วิแล้วค่อยไปหน้า login
      } else {
        const errorData = await response.json();
        errorMsg.textContent =
          errorData.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
        errorMsg.classList.remove("d-none");
      }
    } catch (err) {
      console.error("Register error:", err);
      errorMsg.textContent = "เชื่อมต่อ server ไม่สำเร็จ";
      errorMsg.classList.remove("d-none");
    }
  });

// ปุ่มเข้าสู่ระบบ
document.getElementById("toLoginBtn").addEventListener("click", function () {
  window.location = "login.html";
});
