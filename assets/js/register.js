// ฟังก์ชันช่วยจำลองระบบเก็บ user
function getUsers() {
  // ดึง users (array) จาก localStorage
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function saveUser(user) {
  let users = getUsers();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}
function emailExists(email) {
  let users = getUsers();
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}

// กด "เข้าสู่ระบบ" กลับหน้า login
document.getElementById("toLoginBtn").onclick = function () {
  window.location = "login.html";
};

document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    // ดึงค่าจากฟอร์ม
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const errorEl = document.getElementById("registerError");
    errorEl.classList.add("d-none");
    errorEl.textContent = "";

    // ตรวจสอบรหัสผ่าน
    if (password !== confirmPassword) {
      errorEl.textContent = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน";
      errorEl.classList.remove("d-none");
      return;
    }
    // ตรวจสอบอีเมลซ้ำ
    if (emailExists(email)) {
      errorEl.textContent = "อีเมลนี้ถูกใช้ลงทะเบียนแล้ว";
      errorEl.classList.remove("d-none");
      return;
    }
    // บันทึก user ใหม่ (mock)
    saveUser({
      firstName,
      lastName,
      email,
      username,
      password,
    });

    // แจ้งเตือน Toast และ redirect ไป login
    const toastEl = document.getElementById("registerToast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    setTimeout(() => {
      window.location = "login.html";
    }, 1600);
  });
