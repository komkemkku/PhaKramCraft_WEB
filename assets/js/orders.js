// สถานะ: pending, paid, shipping, delivered, cancelled, history

function getOrders() {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}
function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Auto-move "delivered" > "history" หลัง 3 วัน
function autoMoveDeliveredToHistory() {
  let orders = getOrders();
  let now = new Date();
  let changed = false;
  orders.forEach((order) => {
    if (order.status === "delivered" && order.deliveredDate) {
      let deliveredDate = new Date(order.deliveredDate);
      let diffDays = (now - deliveredDate) / (1000 * 60 * 60 * 24);
      if (diffDays >= 3) {
        order.status = "history";
        changed = true;
      }
    }
  });
  if (changed) saveOrders(orders);
}

function renderOrders(status = "pending") {
  autoMoveDeliveredToHistory();
  let orders = getOrders().filter((o) =>
    status === "history" ? o.status === "history" : o.status === status
  );
  const listEl = document.getElementById("orderList");
  const emptyEl = document.getElementById("orderEmpty");
  listEl.innerHTML = "";
  if (!orders.length) {
    emptyEl.classList.remove("d-none");
    return;
  }
  emptyEl.classList.add("d-none");
  orders.forEach((order) => {
    let statusText = {
      pending: "รอชำระเงิน",
      paid: "ชำระเงินแล้ว",
      shipping: "กำลังจัดส่ง",
      delivered: "จัดส่งสำเร็จ",
      cancelled: "ยกเลิก",
      history: "ประวัติ",
    }[order.status];
    let badgeClass = `status-${order.status}`;
    listEl.innerHTML += `
      <div class="order-card p-3 mb-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap mb-2">
          <div>
            <span class="fw-bold">คำสั่งซื้อ #${order.id}</span>
            <span class="ms-3 small text-muted">วันที่สั่ง: ${order.date}</span>
          </div>
          <span class="order-status-badge ${badgeClass}">${statusText}</span>
        </div>
        <div class="row">
          <div class="col-md-8 mb-2">
            <div class="small">สินค้า: ${order.items
              .map((i) => i.name + " x" + i.qty)
              .join(", ")}</div>
            <div class="small">ยอดรวม: <b>${order.total.toLocaleString()} บาท</b></div>
            <div class="small">ที่อยู่: ${order.address}</div>
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

// ------- Actions ---------
window.cancelOrder = function (id) {
  if (confirm("คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?")) {
    let orders = getOrders();
    let order = orders.find((o) => o.id === id);
    if (order && order.status === "pending") {
      order.status = "cancelled";
      saveOrders(orders);
      renderOrders(currentTabStatus);
    }
  }
};

window.payOrder = function (id) {
  alert("ไปหน้าชำระเงิน (Demo)");
  // หรือเชื่อมต่อ API/หน้า payment จริง
};

window.trackOrder = function (tracking) {
  alert(
    `ติดตามพัสดุหมายเลข: ${tracking}\n(ลิงก์ไปยังเว็บขนส่งหรือแสดง Modal รายละเอียด)`
  );
};

window.confirmReceived = function (id) {
  if (confirm("ยืนยันได้รับสินค้าแล้ว?")) {
    let orders = getOrders();
    let order = orders.find((o) => o.id === id);
    if (order && order.status === "delivered") {
      order.status = "history";
      saveOrders(orders);
      renderOrders(currentTabStatus);
    }
  }
};

// ---- Tabs -----
let currentTabStatus = "pending";
document.querySelectorAll("#orderTabs .nav-link").forEach((tab) => {
  tab.onclick = function () {
    document
      .querySelectorAll("#orderTabs .nav-link")
      .forEach((t) => t.classList.remove("active"));
    this.classList.add("active");
    currentTabStatus = this.getAttribute("data-status");
    renderOrders(currentTabStatus);
  };
});

// --- Demo data (ถ้าไม่มี order ใน localStorage) ---
document.addEventListener("DOMContentLoaded", function () {
  let orders = getOrders();
  if (!orders.length) {
    orders = [
      {
        id: "00125",
        date: "2025-06-13",
        status: "pending",
        items: [{ name: "ผ้าครามลายดั้งเดิม", qty: 1 }],
        total: 950,
        address: "สมชาย ใจดี, 123/1 ถ.สุขใจ กรุงเทพ 10110",
      },
      {
        id: "00122",
        date: "2025-06-10",
        status: "shipping",
        items: [{ name: "ผ้าครามผสมลายสวย", qty: 2 }],
        total: 2180,
        address: "สมศรี แซ่ตั้ง, 55 หมู่ 2 ขอนแก่น 40000",
        tracking: "TH1234567890",
      },
      {
        id: "00119",
        date: "2025-06-07",
        status: "delivered",
        deliveredDate: "2025-06-10",
        items: [{ name: "ผ้าครามสีน้ำเงินเข้ม", qty: 1 }],
        total: 890,
        address: "มนัส สวยมาก, 99/4 พิษณุโลก 65000",
      },
    ];
    saveOrders(orders);
  }
  // แสดง email profile (mock)
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  document.getElementById("profileEmail").textContent = profile.email || "";
  renderOrders("pending");
});
