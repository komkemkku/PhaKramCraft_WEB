function getAddresses() {
  return JSON.parse(localStorage.getItem("addresses") || "[]");
}
function getCartCheckout() {
  return JSON.parse(localStorage.getItem("cart_checkout") || "[]");
}
function clearCheckoutCart() {
  localStorage.removeItem("cart_checkout");
}

function renderAddresses() {
  const addresses = getAddresses();
  const addressList = document.getElementById("addressList");
  addressList.innerHTML = "";
  if (!addresses.length) {
    addressList.innerHTML = `<div class="text-muted small">ยังไม่มีข้อมูลที่อยู่จัดส่ง <a href="address.html">เพิ่มที่อยู่</a></div>`;
    return;
  }
  addresses.forEach((ad, idx) => {
    addressList.innerHTML += `
      <button type="button" class="list-group-item list-group-item-action address-item mb-2" data-idx="${idx}">
        <div class="fw-semibold">${ad.fullname} <span class="ms-2 badge text-bg-light">${ad.tel}</span></div>
        <div class="small text-muted">${ad.address}, ${ad.province} ${ad.postcode}</div>
      </button>`;
  });
  // default select first
  selectAddress(0);
  document.querySelectorAll(".address-item").forEach((btn) => {
    btn.onclick = function () {
      document
        .querySelectorAll(".address-item")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectAddress(btn.getAttribute("data-idx"));
    };
  });
}
let selectedAddressIdx = 0;
function selectAddress(idx) {
  selectedAddressIdx = idx;
  document.querySelectorAll(".address-item").forEach((b, i) => {
    b.classList.toggle("active", i == idx);
  });
}

function renderCartCheckout() {
  const cart = getCartCheckout();
  const tbody = document.querySelector("#checkoutCart tbody");
  let total = 0;
  tbody.innerHTML = "";
  cart.forEach((item) => {
    tbody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td class="text-center">${item.qty}</td>
        <td class="text-end">${item.price.toLocaleString()} บาท</td>
        <td class="text-end">${(
          item.price * item.qty
        ).toLocaleString()} บาท</td>
      </tr>
    `;
    total += item.price * item.qty;
  });
  total += 50; // ค่าจัดส่ง
  document.getElementById("totalAmount").textContent = total.toLocaleString();
}

document.addEventListener("DOMContentLoaded", function () {
  renderAddresses();
  renderCartCheckout();
});

document.getElementById("submitOrderBtn").onclick = function () {
  const errorEl = document.getElementById("checkoutError");
  errorEl.classList.add("d-none");
  errorEl.textContent = "";
  const addresses = getAddresses();
  const cart = getCartCheckout();
  if (!addresses.length) {
    errorEl.textContent = "กรุณาเพิ่มที่อยู่ก่อนสั่งซื้อ";
    errorEl.classList.remove("d-none");
    return;
  }
  // Check select address
  const addr = addresses[selectedAddressIdx];
  if (!addr) {
    errorEl.textContent = "กรุณาเลือกที่อยู่จัดส่ง";
    errorEl.classList.remove("d-none");
    return;
  }
  if (!cart.length) {
    errorEl.textContent = "ไม่มีสินค้าในรายการสั่งซื้อ";
    errorEl.classList.remove("d-none");
    return;
  }
  // สร้าง order ใหม่ (mock)
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  let orderId = (Math.floor(Math.random() * 90000) + 10000).toString();
  let today = new Date();
  let items = cart.map((i) => ({ name: i.name, qty: i.qty }));
  let total = cart.reduce((sum, i) => sum + i.price * i.qty, 0) + 50;
  orders.unshift({
    id: orderId,
    date: today.toISOString().split("T")[0],
    status: "pending",
    items,
    total,
    address: `${addr.fullname}, ${addr.address}, ${addr.province} ${addr.postcode}, ${addr.tel}`,
  });
  localStorage.setItem("orders", JSON.stringify(orders));
  clearCheckoutCart();
  // ไปหน้า orders
  window.location = "orders.html";
};
