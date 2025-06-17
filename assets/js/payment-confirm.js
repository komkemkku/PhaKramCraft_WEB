const ORDER_API = "http://localhost:3000/orderUsers";
const ORDERPAY_API = "http://localhost:3000/order-payments";

// อ่าน order id จาก url
function getOrderId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("order");
}

document.getElementById("paymentConfirmForm").onsubmit = async function (e) {
  e.preventDefault();
  const slip = document.getElementById("slip").files[0];
  const transferDate = document.getElementById("transferDate").value;
  const transferTime = document.getElementById("transferTime").value;
  const errorMsg = document.getElementById("errorMsg");

  // validate
  if (!slip || !transferDate || !transferTime) {
    errorMsg.textContent = "กรุณาแนบสลิปและระบุวัน/เวลาที่โอนเงิน";
    errorMsg.classList.remove("d-none");
    return;
  }
  errorMsg.classList.add("d-none");

  const orderId = getOrderId();
  if (!orderId) {
    Swal.fire("ผิดพลาด", "ไม่พบเลขคำสั่งซื้อ", "error");
    return;
  }
  const token = localStorage.getItem("jwt_token");

  // เตรียม FormData
  const formData = new FormData();
  formData.append("slip", slip);
  formData.append("transfer_date", transferDate);
  formData.append("transfer_time", transferTime);

  try {
    const res = await fetch(`${ORDERPAY_API}/${orderId}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
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
