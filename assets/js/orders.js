const ORDER_API = "https://phakramcraftapi-production.up.railway.app/orderUsers";
const PROFILE_API =
  "https://phakramcraftapi-production.up.railway.app/users/me/info";
let currentTabStatus = "pending"; // อังกฤษเท่านั้น

// Toast helper
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
function showReceivedToast() {
  var toastEl = document.getElementById("receivedToast");
  if (toastEl) {
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// ดึงข้อมูลผู้ใช้
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

// ดึง order จาก API ตาม status (ภาษาอังกฤษ)
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

// Mapping สถานะอังกฤษ > ไทย สำหรับแสดง (UI)
function mapStatusToThai(status) {
  return (
    {
      pending: "รอชำระเงิน",
      paid: "ชำระเงินแล้ว",
      shipping: "รอจัดส่ง",
      delivered: "จัดส่งแล้ว",
      cancelled: "ยกเลิก",
    }[status] || status
  );
}

// แสดง order ตาม status (ใช้ status อังกฤษ)
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
    let statusText = mapStatusToThai(order.status);
    let badgeClass = `status-${order.status}`;
    let canConfirm = order.status === "delivered" ? false : true;
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
              order.tracking_no
                ? `<div class="small mt-1">เลขพัสดุ: 
                  <span class="fw-semibold">${order.tracking_no}</span>
                  <button class="btn btn-sm btn-link p-0 ps-2" style="font-size:0.95em;" onclick="trackOrder('${order.tracking_no}')">
                    <i class="bi bi-box-arrow-up-right"></i> ติดตามพัสดุ
                  </button>
                  </div>`
                : ""
            }
          </div>
          <div class="col-md-4 text-end align-self-end">
            ${
              order.status === "pending"
                ? `<button class="btn btn-sm btn-outline-danger me-2" onclick="cancelOrder('${order.id}')">ยกเลิก</button>
                   <button class="btn btn-sm btn-purple" onclick="payOrder('${order.id}')">ชำระเงิน</button>`
                : order.status === "shipping"
                ? order.tracking_no
                  ? `<button class="btn btn-sm btn-outline-primary" onclick="trackOrder('${order.tracking_no}')">ติดตามพัสดุ</button>`
                  : `<span class="text-secondary small">รอเลขพัสดุ</span>`
                : order.status === "delivered"
                ? `<button class="btn btn-sm btn-success" onclick="confirmReceived('${order.id}')" disabled>ได้รับสินค้าแล้ว</button>`
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

// กดติดตามพัสดุ -> เปิดหน้า track ของไปรษณีย์ไทย
window.trackOrder = function (tracking) {
  if (!tracking) {
    alert("ยังไม่มีเลขพัสดุ");
    return;
  }
  const url = `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(
    tracking
  )}`;
  window.open(url, "_blank");
};

// ยืนยันรับสินค้า (ห้ามแก้ไขสถานะหลังจากนี้)
window.confirmReceived = async function (id) {
  // SweetAlert2 ยืนยัน
  const result = await Swal.fire({
    title: "ยืนยันได้รับสินค้าแล้ว?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  });
  if (!result.isConfirmed) return;

  const token = localStorage.getItem("jwt_token");
  // PATCH: เปลี่ยนสถานะเป็น delivered
  const res = await fetch(`${ORDER_API}/${id}/receive`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
  });
  if (res.ok) {
    // แจ้งเตือนสำเร็จ
    Swal.fire({
      icon: "success",
      title: "ขอบคุณที่ยืนยันรับสินค้า!",
      text: "ขอให้มีความสุขกับสินค้า 😊",
      showConfirmButton: false,
      timer: 2000,
    });
    renderOrders(currentTabStatus);
  } else {
    Swal.fire("เกิดข้อผิดพลาด", "", "error");
  }
};

// ----- Tabs -----
document.querySelectorAll("#orderTabs .nav-link").forEach((tab) => {
  tab.onclick = function () {
    document
      .querySelectorAll("#orderTabs .nav-link")
      .forEach((t) => t.classList.remove("active"));
    this.classList.add("active");
    // ใช้ data-status ภาษาอังกฤษ เช่น pending, paid, shipping, delivered, cancelled
    currentTabStatus = this.getAttribute("data-status") || "";
    renderOrders(currentTabStatus);
  };
});

// ----- On load -----
document.addEventListener("DOMContentLoaded", () => {
  renderProfile(); // โหลด email ผู้ใช้
  renderOrders(currentTabStatus); // โหลดออเดอร์ (สถานะเป็นอังกฤษ)
});
