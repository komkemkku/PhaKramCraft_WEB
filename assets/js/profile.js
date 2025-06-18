const API_BASE = "https://phakramcraftapi-production.up.railway.app";
const TOKEN = localStorage.getItem("jwt_token");

// ดึงข้อมูล user + id
async function fetchUserProfile() {
  const res = await fetch(`${API_BASE}/users/me/info`, {
    headers: { Authorization: "Bearer " + TOKEN },
  });
  if (!res.ok) throw new Error("โหลดข้อมูลโปรไฟล์ล้มเหลว");
  const data = await res.json();
  return data.user; // หรือ data.user.id เอาไว้ PATCH
}

// อัปเดตโปรไฟล์ (ใช้ PATCH /users/:id)let user = null; // ต้องเก็บ user object ทั้งหมดไว้

// โหลดข้อมูล user
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const res = await fetch(
      "https://phakramcraftapi-production.up.railway.app/users/me/info",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt_token"),
        },
      }
    );
    const data = await res.json();
    user = data.user; // <<== เก็บไว้ทั้ง object

    document.getElementById("firstName").value = user.firstname || "";
    document.getElementById("lastName").value = user.lastname || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("profileEmail").textContent = user.email || "";
  } catch (e) {
    document.getElementById("profileError").textContent = "โหลดข้อมูลผิดพลาด";
    document.getElementById("profileError").classList.remove("d-none");
  }
});

// บันทึกการแก้ไข
document
  .getElementById("profileForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const errorEl = document.getElementById("profileError");
    errorEl.classList.add("d-none");
    errorEl.textContent = "";

    // รวบรวมข้อมูลใหม่
    const updatedUser = {
      firstname: document.getElementById("firstName").value.trim(),
      lastname: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      username: user.username, // <<== ส่ง username เดิมไปด้วย!
    };

    // ต้องกรอกรหัสผ่านปัจจุบันเสมอ (ตามที่คุณบังคับ)
    const currentPassword = document.getElementById("currentPassword").value;
    if (!currentPassword) {
      errorEl.textContent = "กรุณากรอกรหัสผ่านปัจจุบัน";
      errorEl.classList.remove("d-none");
      return;
    }

    // ถ้าต้องการเปลี่ยนรหัสผ่าน
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
    } else {
      updatedUser.password = currentPassword; // ไม่เปลี่ยนรหัสผ่านแต่ต้องส่ง (หลังบ้านคุณบังคับไว้)
    }

    // ส่งไป PATCH
    try {
      const res = await fetch(
        `https://phakramcraftapi-production.up.railway.app/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("jwt_token"),
          },
          body: JSON.stringify(updatedUser),
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ");

      document.getElementById("saveSuccess").classList.remove("d-none");
      setTimeout(() => {
        document.getElementById("saveSuccess").classList.add("d-none");
      }, 1400);

      // clear fields
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmNewPassword").value = "";
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove("d-none");
    }
  });
