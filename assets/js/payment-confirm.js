const ORDER_API =
  "https://phakramcraftapi-production.up.railway.app/orderUsers";
const ORDERPAY_API =
  "https://phakramcraftapi-production.up.railway.app/order-payments";

// อ่าน order id จาก url เช่น ...?order=123
function getOrderId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("order");
}

const orderId = getOrderId();
const token = localStorage.getItem("jwt_token");

// ====== 1. ดึงข้อมูลออเดอร์มาดู/แสดงในหน้า ======
async function loadOrderInfo() {
  if (!orderId) {
    Swal.fire("ผิดพลาด", "ไม่พบเลขคำสั่งซื้อ", "error");
    return;
  }
  try {
    const res = await fetch(`${ORDER_API}/${orderId}`, {
      headers: token ? { Authorization: "Bearer " + token } : {},
    });
    if (!res.ok) throw new Error("ดึงข้อมูลออเดอร์ไม่สำเร็จ");
    const data = await res.json();

    // ตรวจสอบและแก้ไขจุดนี้
    const ord = data.order;
    if (!ord) {
      document.getElementById(
        "orderInfo"
      ).innerHTML = `<div class="alert alert-danger">ไม่พบข้อมูลคำสั่งซื้อ</div>`;
      return;
    }
    document.getElementById("orderInfo").innerHTML = `
      <div class="alert alert-light mb-3">
        <div>เลขคำสั่งซื้อ: <b>#${ord.id}</b></div>
        <div>ยอดชำระ: <b>${Number(
          ord.total_price || ord.total_amount || 0
        ).toLocaleString()} บาท</b></div>
        <div>สถานะ: <span class="badge bg-info">${
          ord.status || "-"
        }</span></div>
      </div>
    `;
  } catch (err) {
    document.getElementById(
      "orderInfo"
    ).innerHTML = `<div class="alert alert-danger">ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ</div>`;
    Swal.fire("ผิดพลาด", err.message || "เกิดข้อผิดพลาด", "error");
  }
}

// ====== 2. ส่งยืนยันชำระเงิน ======
document.getElementById("paymentConfirmForm").onsubmit = async function (e) {
  e.preventDefault();
  const transferDate = document.getElementById("transferDate").value;
  const transferTime = document.getElementById("transferTime").value;
  const errorMsg = document.getElementById("errorMsg");

  if (!transferDate || !transferTime) {
    errorMsg.textContent = "กรุณาระบุวันและเวลาที่โอนเงิน";
    errorMsg.classList.remove("d-none");
    return;
  }
  errorMsg.classList.add("d-none");

  if (!orderId) {
    Swal.fire("ผิดพลาด", "ไม่พบเลขคำสั่งซื้อ", "error");
    return;
  }

  try {
    const res = await fetch(`${ORDERPAY_API}/${orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: "Bearer " + token }),
      },
      body: JSON.stringify({
        transfer_date: transferDate,
        transfer_time: transferTime,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      Swal.fire("ผิดพลาด", data?.error || "แจ้งชำระเงินไม่สำเร็จ", "error");
      return;
    }
    Swal.fire({
      icon: "success",
      title: "แจ้งชำระเงินสำเร็จ",
      text: "ขอบคุณที่แจ้งชำระเงิน ทางร้านจะดำเนินการตรวจสอบให้เร็วที่สุด",
      confirmButtonText: "ตกลง",
    }).then(() => {
      window.location = "orders.html";
    });
  } catch (err) {
    Swal.fire("ผิดพลาด", "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", "error");
  }
};

// ====== เรียกโหลดข้อมูลออเดอร์ตอนหน้าเพิ่งโหลด ======
if (document.getElementById("orderInfo")) {
  loadOrderInfo();
}
