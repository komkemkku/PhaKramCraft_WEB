const ADDRESS_API = "http://localhost:3000/addresses";
const CART_API = "http://localhost:3000/carts";
const CHECKOUT_API = "http://localhost:3000/checkouts";

// ==== STATE ====
let addresses = [];
let selectedAddressIdx = 0;
let cartItems = [];

// ===== API =====
async function fetchAddresses() {
  const token = localStorage.getItem("jwt_token");
  if (!token) return [];
  const res = await fetch(ADDRESS_API, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) return [];
  return await res.json();
}

// ดึงสินค้าในตะกร้า (เฉพาะที่เลือกไว้ selected)
async function fetchCartItems() {
  const token = localStorage.getItem("jwt_token");
  if (!token) return [];
  const res = await fetch(CART_API, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.cart && Array.isArray(data.cart.cartitems)) {
    // FILTER เฉพาะ selected
    return data.cart.cartitems.filter((item) => item.selected);
  }
  return [];
}

// ==== RENDER UI ====
function renderAddresses() {
  const addressList = document.getElementById("addressList");
  addressList.innerHTML = "";
  if (!addresses.length) {
    addressList.innerHTML = `<div class="text-muted small">ยังไม่มีข้อมูลที่อยู่จัดส่ง <a href="address.html">เพิ่มที่อยู่</a></div>`;
    return;
  }
  addresses.forEach((ad, idx) => {
    addressList.innerHTML += `
      <button type="button" 
        class="list-group-item list-group-item-action address-item mb-2${
          idx === selectedAddressIdx ? " active" : ""
        }" 
        data-idx="${idx}">
        <div class="fw-semibold">
          ${ad.fullname} <span class="ms-2 badge text-bg-light">${ad.tel}</span>
        </div>
        <div class="small text-muted">${ad.address}, ${ad.province} ${
      ad.postcode
    }</div>
      </button>`;
  });
  document.querySelectorAll(".address-item").forEach((btn) => {
    btn.onclick = function () {
      selectAddress(Number(btn.getAttribute("data-idx")));
    };
  });
}
function selectAddress(idx) {
  selectedAddressIdx = idx;
  document.querySelectorAll(".address-item").forEach((b, i) => {
    b.classList.toggle("active", i == idx);
  });
}

// แสดงสินค้าในตะกร้าที่จะชำระ
function renderCartCheckout() {
  const tbody = document.querySelector("#checkoutCart tbody");
  let total = 0;
  tbody.innerHTML = "";
  cartItems.forEach((item) => {
    const productName = item.name || item.product_name || "-";
    const price = item.price || item.product_price || 0;
    const amount = item.amount || item.product_amount || 1;
    tbody.innerHTML += `
      <tr>
        <td>${productName}</td>
        <td class="text-center">${amount}</td>
        <td class="text-end">${parseFloat(price).toLocaleString()} บาท</td>
        <td class="text-end">${(
          parseFloat(price) * amount
        ).toLocaleString()} บาท</td>
      </tr>
    `;
    total += parseFloat(price) * amount;
  });
  total += 50; // ค่าจัดส่ง
  document.getElementById("totalAmount").textContent = total.toLocaleString();
}

// ==== โหลดข้อมูลเมื่อเปิดเพจ ====
document.addEventListener("DOMContentLoaded", async function () {
  addresses = await fetchAddresses();
  selectedAddressIdx = 0;
  renderAddresses();
  cartItems = await fetchCartItems();
  renderCartCheckout();
});

// ==== ยืนยันสั่งซื้อ ====
document.getElementById("submitOrderBtn").onclick = async function () {
  const errorEl = document.getElementById("checkoutError");
  errorEl.classList.add("d-none");
  errorEl.textContent = "";

  // กันกดปุ่มรัว
  const btn = document.getElementById("submitOrderBtn");
  btn.disabled = true;

  if (!addresses.length) {
    errorEl.textContent = "กรุณาเพิ่มที่อยู่ก่อนสั่งซื้อ";
    errorEl.classList.remove("d-none");
    btn.disabled = false;
    return;
  }
  const addr = addresses[selectedAddressIdx];
  if (!addr) {
    errorEl.textContent = "กรุณาเลือกที่อยู่จัดส่ง";
    errorEl.classList.remove("d-none");
    btn.disabled = false;
    return;
  }
  if (!cartItems.length) {
    errorEl.textContent = "ไม่มีสินค้าในรายการสั่งซื้อ";
    errorEl.classList.remove("d-none");
    btn.disabled = false;
    return;
  }

  try {
    // ดึง cart_item_id ที่ selected (ใช้ id, หรือ cart_item_id)
    const cartitem_ids = cartItems.map((item) => item.id || item.cart_item_id);
    if (!cartitem_ids.length) {
      errorEl.textContent = "ไม่พบ cart item id ในรายการ";
      errorEl.classList.remove("d-none");
      btn.disabled = false;
      return;
    }
    const address_id = addr.id;
    const token = localStorage.getItem("jwt_token");
    const res = await fetch(CHECKOUT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        address_id,
        cartitem_ids,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "สั่งซื้อไม่สำเร็จ";
      errorEl.classList.remove("d-none");
      // แนะนำให้รีเฟรช cart เผื่อ stock ไม่พอหรือมีปัญหาอื่น
      cartItems = await fetchCartItems();
      renderCartCheckout();
      btn.disabled = false;
      return;
    }

    // ไปหน้า orders
    window.location = "orders.html?order=" + data.order_id;
  } catch (err) {
    errorEl.textContent = "เกิดข้อผิดพลาด: " + (err.message || err);
    errorEl.classList.remove("d-none");
    btn.disabled = false;
  }
};
