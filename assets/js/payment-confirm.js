function getCurrentOrder() {
  const url = new URL(window.location.href);
  const orderId = url.searchParams.get("order");
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  return { order: orders.find((o) => o.id === orderId), orderId, orders };
}

document.getElementById("paymentConfirmForm").onsubmit = function (e) {
  e.preventDefault();
  const slip = document.getElementById("slip").files[0];
  const transferDate = document.getElementById("transferDate").value;
  const transferTime = document.getElementById("transferTime").value;
  const errorMsg = document.getElementById("errorMsg");
  if (!slip || !transferDate || !transferTime) {
    errorMsg.textContent = "กรุณาแนบสลิปและระบุวัน/เวลาที่โอนเงิน";
    errorMsg.classList.remove("d-none");
    return;
  }
  // อัปเดตสถานะ order
  let { order, orderId, orders } = getCurrentOrder();
  if (!order) return;
  order.status = "paid";
  order.slip = slip.name; // ในระบบจริงควร upload และเก็บ url
  order.transferDate = transferDate;
  order.transferTime = transferTime;
  localStorage.setItem("orders", JSON.stringify(orders));
  // redirect กลับ orders.html
  window.location = "orders.html";
};
