// โหลด user จำลอง (mock) จาก localStorage
function getProfile() {
  // ตัวอย่าง: สมมุติ login แล้วมี user ใน localStorage ('profile')
  return JSON.parse(
    localStorage.getItem("profile") ||
      '{"firstName":"","lastName":"","email":"","phone":""}'
  );
}
function saveProfile(user) {
  localStorage.setItem("profile", JSON.stringify(user));
}

document.addEventListener("DOMContentLoaded", function () {
  const user = getProfile();
  // เติมค่าในฟอร์ม
  document.getElementById("firstName").value = user.firstName || "";
  document.getElementById("lastName").value = user.lastName || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("profileEmail").textContent = user.email || "";

  // บันทึกฟอร์ม
  document
    .getElementById("profileForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const updatedUser = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
      };
      saveProfile(updatedUser);
      document.getElementById("saveSuccess").classList.remove("d-none");
      setTimeout(() => {
        document.getElementById("saveSuccess").classList.add("d-none");
      }, 1400);
    });
});

// ฟังก์ชัน user mock (แบบ localStorage demo)
function getProfile() {
  return JSON.parse(
    localStorage.getItem("profile") ||
      '{"firstName":"","lastName":"","email":"","phone":"","password":"123456"}'
  );
}
function saveProfile(user) {
  localStorage.setItem("profile", JSON.stringify(user));
}

document.addEventListener("DOMContentLoaded", function () {
  const user = getProfile();
  document.getElementById("firstName").value = user.firstName || "";
  document.getElementById("lastName").value = user.lastName || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("profileEmail").textContent = user.email || "";

  document
    .getElementById("profileForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const errorEl = document.getElementById("profileError");
      errorEl.classList.add("d-none");
      errorEl.textContent = "";

      const updatedUser = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        password: user.password, // default คือ password เดิม
      };

      // ตรวจสอบรหัสผ่านปัจจุบัน
      const currentPassword = document.getElementById("currentPassword").value;
      if (!currentPassword || currentPassword !== user.password) {
        errorEl.textContent =
          "กรุณากรอกรหัสผ่านปัจจุบันให้ถูกต้องเพื่อยืนยันการเปลี่ยนแปลง";
        errorEl.classList.remove("d-none");
        return;
      }

      // ตรวจสอบการเปลี่ยนรหัสผ่านใหม่ (optional)
      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword =
        document.getElementById("confirmNewPassword").value;

      if (newPassword || confirmNewPassword) {
        if (newPassword.length < 6) {
          errorEl.textContent = "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร";
          errorEl.classList.remove("d-none");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          errorEl.textContent = "รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน";
          errorEl.classList.remove("d-none");
          return;
        }
        updatedUser.password = newPassword;
      }

      saveProfile(updatedUser);
      document.getElementById("saveSuccess").classList.remove("d-none");
      setTimeout(() => {
        document.getElementById("saveSuccess").classList.add("d-none");
      }, 1400);

      // เคลียร์ฟิลด์รหัสผ่าน
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmNewPassword").value = "";
    });
});
