const NOTIFICATIONS_API = "http://localhost:3000/notifications";

async function fetchNotifications() {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(NOTIFICATIONS_API, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications || [];
}

// ฟังก์ชัน render แจ้งเตือน
async function renderNotifications() {
  const notificationList = document.getElementById("notificationList");
  notificationList.innerHTML = "<li>กำลังโหลด...</li>";
  const notifications = await fetchNotifications();
  if (!notifications.length) {
    notificationList.innerHTML = `<li class="text-muted">ไม่มีแจ้งเตือน</li>`;
    return;
  }
  notificationList.innerHTML = "";
  notifications.forEach((noti) => {
    let badge = "";
    if (!noti.is_read) {
      badge = `<span class="badge bg-warning ms-2">ใหม่</span>`;
    }
    notificationList.innerHTML += `
      <li class="mb-2">
        <span class="fw-semibold text-purple">${noti.message}</span>
        <span class="small text-muted ms-2">${formatDate(
          noti.created_at
        )}</span>
        ${badge}
        ${
          noti.order_id
            ? `<a href="orders.html" class="ms-2 small text-decoration-underline">ดูคำสั่งซื้อ</a>`
            : ""
        }
      </li>
    `;
  });
}

// Helper สำหรับแปลงวันเวลา
function formatDate(dt) {
  const d = new Date(dt);
  return (
    d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }) +
    " " +
    d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

// กดแล้วแสดง toast พร้อมโหลด noti ใหม่
document
  .getElementById("showNotificationBtn")
  .addEventListener("click", function () {
    renderNotifications();
    const toast = new bootstrap.Toast(
      document.getElementById("notificationToast"),
      { delay: 7000 }
    );
    toast.show();
  });

// อาจเพิ่ม: เมื่อ toast ปิด → mark ว่าอ่านแล้วทุกอัน
document
  .getElementById("notificationToast")
  .addEventListener("hidden.bs.toast", async function () {
    const token = localStorage.getItem("jwt_token");
    await fetch(NOTIFICATIONS_API + "/read-all", {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token },
    });
  });
