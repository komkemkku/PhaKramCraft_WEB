const ORDER_API = "http://localhost:3000/orderUsers";
const PROFILE_API = "http://localhost:3000/users/me/info"; 
let currentTabStatus = "pending";

// ----- Toast helper -----
function showToastSuccess() {
  var toastEl = document.getElementById("orderCancelToast");
  if (toastEl) {
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}
function showToastFail() {
  var toastEl = document.getElementById("orderCancelFailToast");
  if (toastEl) {
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// ----- ดึงข้อมูลผู้ใช้ -----
async function fetchProfile() {
  const token = localStorage.getItem("jwt_token");
  if (!token) return null;
  try {
    const res = await fetch(PROFILE_API, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || data.profile || null;
  } catch {
    return null;
  }
}

async function renderProfile() {
  const user = await fetchProfile();
  const emailEl = document.getElementById("profileEmail");
  if (emailEl && user && user.email) {
    emailEl.textContent = user.email;
  } else if (emailEl) {
    emailEl.textContent = "";
  }
}

// ----- ดึง order จาก API ตามสถานะ -----
async function fetchOrders(status) {
  const token = localStorage.getItem("jwt_token");
  let url = ORDER_API;
  if (status && status !== "") url += "?status=" + status;
  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders || [];
}

// helper สำหรับแสดงที่อยู่ครบถ้วน
function renderAddress(address) {
  if (!address) return "-";
  let html = `<div>${address.fullname || ""} ${
    address.tel ? " (" + address.tel + ")" : ""
  }</div>`;
  html += `<div>${address.address || ""}${
    address.province ? " จ." + address.province : ""
  } ${address.postcode || ""}</div>`;
  return html;
}

// ----- แสดง order ตามสถานะ -----
async function renderOrders(status = "pending") {
  const orders = await fetchOrders(status);
  const listEl = document.getElementById("orderList");
  const emptyEl = document.getElementById("orderEmpty");
  listEl.innerHTML = "";
  if (!orders.length) {
    emptyEl.classList.remove("d-none");
    return;
  }
  emptyEl.classList.add("d-none");
  orders.forEach((order) => {
    let statusText =
      {
        pending: "รอชำระเงิน",
        paid: "ชำระเงินแล้ว",
        shipping: "รอจัดส่ง",
        delivered: "จัดส่งแล้ว",
        cancelled: "ยกเลิก",
      }[order.status] || order.status;
    let badgeClass = `status-${order.status}`;
    listEl.innerHTML += `
      <div class="order-card p-3 mb-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap mb-2">
          <div>
            <span class="fw-bold">คำสั่งซื้อ #${order.id}</span>
            <span class="ms-3 small text-muted">วันที่สั่ง: ${
              order.created_at
                ? new Date(order.created_at).toLocaleDateString()
                : ""
            }</span>
          </div>
          <span class="order-status-badge ${badgeClass}">${statusText}</span>
        </div>
        <div class="row">
          <div class="col-md-8 mb-2">
            <div class="small">สินค้า: ${
              order.items && order.items.length
                ? order.items
                    .map((i) => i.product_name + " x" + i.product_amount)
                    .join(", ")
                : "-"
            }</div>
            <div class="small">ยอดรวม: <b>${Number(
              order.total_price || 0
            ).toLocaleString()} บาท</b></div>
            <div class="small">ที่อยู่:<br> ${renderAddress(
              order.address
            )}</div>
            ${
              order.tracking
                ? `<div class="small mt-1">เลขพัสดุ: <span class="fw-semibold">${order.tracking}</span></div>`
                : ""
            }
          </div>
          <div class="col-md-4 text-end align-self-end">
            ${
              order.status === "pending"
                ? `<button class="btn btn-sm btn-outline-danger me-2" onclick="cancelOrder('${order.id}')">ยกเลิก</button>
                   <button class="btn btn-sm btn-purple" onclick="payOrder('${order.id}')">ชำระเงิน</button>`
                : order.status === "shipping"
                ? `<button class="btn btn-sm btn-outline-primary" onclick="trackOrder('${order.tracking}')">ติดตามพัสดุ</button>`
                : order.status === "delivered"
                ? `<button class="btn btn-sm btn-success" onclick="confirmReceived('${order.id}')">ยืนยันได้รับสินค้าแล้ว</button>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  });
}

// --- Actions ใช้ API ---
window.cancelOrder = async function (id) {
  if (!confirm("ต้องการยกเลิกคำสั่งซื้อนี้?")) return;
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(`${ORDER_API}/${id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
  });
  if (res.ok) {
    showToastSuccess();
    renderOrders(currentTabStatus);
  } else {
    showToastFail();
  }
};
window.payOrder = function (id) {
  window.location = `payment.html?order=${id}`;
};
window.trackOrder = function (tracking) {
  alert(`ติดตามพัสดุหมายเลข: ${tracking || "ยังไม่ระบุเลขพัสดุ"}`);
};
window.confirmReceived = async function (id) {
  if (!confirm("ยืนยันได้รับสินค้าแล้ว?")) return;
  // ตัวอย่าง: เรียก PATCH /orderUsers/:id/receive (ถ้ามี API นี้)
  // ถ้าไม่มี API จริง ให้แจ้ง admin หรือติดต่อร้านค้า
  alert("ขอบคุณที่ยืนยันการรับสินค้า!");
  renderOrders(currentTabStatus);
};

// ----- Tabs -----
document.querySelectorAll("#orderTabs .nav-link").forEach((tab) => {
  tab.onclick = function () {
    document
      .querySelectorAll("#orderTabs .nav-link")
      .forEach((t) => t.classList.remove("active"));
    this.classList.add("active");
    currentTabStatus = this.getAttribute("data-status") || "";
    renderOrders(currentTabStatus);
  };
});

// ----- On load -----
document.addEventListener("DOMContentLoaded", () => {
  renderProfile(); // โหลด email ผู้ใช้
  renderOrders(currentTabStatus); // โหลดออเดอร์
});
