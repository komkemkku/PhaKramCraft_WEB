// สมมุติเรามี orderId ใน query เช่น ?order=00123
function getCurrentOrder() {
  const url = new URL(window.location.href);
  const orderId = url.searchParams.get("order");
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  return orders.find((o) => o.id === orderId);
}

document.addEventListener("DOMContentLoaded", function () {
  const order = getCurrentOrder();
  if (!order) {
    alert("ไม่พบคำสั่งซื้อ!");
    window.location = "orders.html";
    return;
  }
  document.getElementById("productAmount").textContent =
    (order.total - 50).toLocaleString() + " บาท";
  document.getElementById("totalAmount").textContent =
    order.total.toLocaleString() + " บาท";

  document.getElementById("nextToConfirm").onclick = function () {
    window.location = `payment-confirm.html?order=${order.id}`;
  };
});
