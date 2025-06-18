const ORDER_API = "https://phakramcraftapi-production.up.railway.app/orderUsers";
const PAYMENTSYSTEMS_API = "https://phakramcraftapi-production.up.railway.app/paymentsystems";
const SHIPPING_COST = 50;

// ----- Utility สำหรับแสดงที่อยู่ -----
function renderAddress(address) {
  if (!address) return "-";
  let html = `<div>${address.fullname || ""}${
    address.tel ? " (" + address.tel + ")" : ""
  }</div>`;
  html += `<div>${address.address || ""}${
    address.province ? " จ." + address.province : ""
  } ${address.postcode || ""}</div>`;
  return html;
}

// ----- Utility อ่าน order id -----
function getOrderId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("order");
}

// ----- API: ดึง order detail -----
async function fetchOrderDetail(orderId) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(`${ORDER_API}/${orderId}`, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.order || null;
}

// ----- API: ดึงช่องทางการชำระเงิน (active เท่านั้น) -----
async function fetchPaymentSystems() {
  const res = await fetch(PAYMENTSYSTEMS_API);
  if (!res.ok) return [];
  const data = await res.json();
  // กรณี response เป็น array ตรงๆ
  if (Array.isArray(data)) {
    return data.filter((ps) => ps.is_active);
  }
  // กรณี response เป็น { paymentSystems: [...] }
  return (data.paymentSystems || []).filter((ps) => ps.is_active);
}

// -------- MAIN --------
document.addEventListener("DOMContentLoaded", async function () {
  const orderId = getOrderId();
  if (!orderId) {
    alert("ไม่พบเลขคำสั่งซื้อ!");
    window.location = "orders.html";
    return;
  }

  // ----- 1. ดึงข้อมูล order -----
  const order = await fetchOrderDetail(orderId);
  if (!order) {
    alert("ไม่พบคำสั่งซื้อ!");
    window.location = "orders.html";
    return;
  }

  // ----- 2. รายการสินค้า -----
  if (document.getElementById("productList"))
    document.getElementById("productList").textContent =
      order.items && order.items.length
        ? order.items
            .map((i) => i.product_name + " x" + i.product_amount)
            .join(", ")
        : "-";

  // ----- 3. ที่อยู่ -----
  if (document.getElementById("addressBlock"))
    document.getElementById("addressBlock").innerHTML = renderAddress(
      order.address
    );

  // ----- 4. ราคาสินค้า -----
  let totalProduct = 0;
  if (order.items && order.items.length) {
    totalProduct = order.items.reduce(
      (sum, i) =>
        sum + Number(i.product_price || 0) * Number(i.product_amount || 1),
      0
    );
  } else if (order.total_price) {
    totalProduct = Number(order.total_price) - SHIPPING_COST;
  }
  if (document.getElementById("productAmount"))
    document.getElementById("productAmount").textContent =
      totalProduct.toLocaleString() + " บาท";
  if (document.getElementById("shippingAmount"))
    document.getElementById("shippingAmount").textContent =
      SHIPPING_COST.toLocaleString() + " บาท";
  if (document.getElementById("totalAmount"))
    document.getElementById("totalAmount").textContent =
      (totalProduct + SHIPPING_COST).toLocaleString() + " บาท";

  // ----- 5. ช่องทางการชำระเงิน -----
  const channels = await fetchPaymentSystems();
  const paymentListEl = document.getElementById("paymentChannelList");
  if (paymentListEl) {
    paymentListEl.innerHTML = "";
    if (!channels.length) {
      paymentListEl.innerHTML = `<div class="alert alert-warning">ยังไม่มีช่องทางการชำระเงิน</div>`;
    } else {
      channels.forEach((ps, idx) => {
        paymentListEl.innerHTML += `
          <div class="card mb-3 p-3">
            <div class="row g-2 align-items-center">
              <!-- QR Code ซ้ายมือ -->
              <div class="col-sm-4 text-center mb-3 mb-sm-0">
                <div class="border rounded shadow-sm d-inline-block p-2 bg-white" style="min-width:130px;min-height:130px;">
                  ${
                    ps.qrcode
                      ? `<img src="${ps.qrcode}" alt="QR Code" class="img-fluid" style="max-width:120px;max-height:120px;" />`
                      : `<div class="text-muted" style="height:120px;display:flex;align-items:center;justify-content:center;">ไม่มี QR</div>`
                  }
                </div>
                <div class="small text-muted mt-2">สแกนจ่าย</div>
              </div>
              <!-- รายละเอียดบัญชี ขวามือ -->
              <div class="col-sm-8">
                <div class="fw-semibold fs-5 mb-1">${ps.name_bank || ""}</div>
                <div class="mb-2">ชื่อบัญชี: <b>${
                  ps.name_account || ""
                }</b></div>
                <div class="mb-2">เลขที่บัญชี: <span class="fw-semibold">${
                  ps.number_account || ""
                }</span></div>
                <div class="mb-2">สาขา: ${ps.name_branch || ""}</div>
              </div>
            </div>
          </div>
        `;
      });
    }
  }

  // ----- 6. ปุ่มถัดไป -----
  const nextBtn = document.getElementById("nextToConfirm");
  if (nextBtn) {
    nextBtn.onclick = function () {
      window.location = `payment-confirm.html?order=${order.id}`;
    };
  }
});
