// เปิดป็อปอัป user modal
document.getElementById("userBtn").addEventListener("click", function () {
  const modal = new bootstrap.Modal(document.getElementById("userModal"));
  modal.show();
});

// ฟังก์ชันนำไปหน้าอื่นๆ (เปลี่ยนเป็นลิงก์จริงหรือใส่การ redirect ตามหลังบ้าน)
function goToProfile() {
  alert("ไปยังหน้าแก้ไขข้อมูลส่วนตัว");
  // window.location = 'profile.html';
}
function goToAddress() {
  alert("ไปยังหน้าจัดการที่อยู่จัดส่ง");
  // window.location = 'address.html';
}
function goToOrders() {
  alert("ไปยังหน้าจัดการคำสั่งซื้อ");
  // window.location = 'orders.html';
}
function logoutUser() {
  if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
    // ลบ token ออกจาก localStorage
    localStorage.removeItem("jwt_token");
    // หา Toast
    var toastEl = document.getElementById("logoutToast");
    if (toastEl) {
      var toast = new bootstrap.Toast(toastEl);
      toast.show();
      // รอให้ Toast แสดงประมาณ 1.3 วินาที ก่อนเปลี่ยนหน้า
      setTimeout(function () {
        window.location = "login.html";
      }, 1300);
    } else {
      // ถ้า Toast ไม่มี ให้ redirect ปกติ
      window.location = "/login.htmllogin.html";
    }
  }
}

function goToProfile() {
  window.location = "profile.html";
}
function goToAddress() {
  window.location = "address.html";
}
function goToOrders() {
  window.location = "orders.html";
}

function logoutUser() {
  if (confirm("ออกจากระบบ?")) alert("ออกจากระบบแล้ว");
}
