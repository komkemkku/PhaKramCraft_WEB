const CART_API = "http://localhost:3000/carts";
const PRODUCT_API = "http://localhost:3000/products";

let cart = null;
let products = [];

function getToken() {
  return localStorage.getItem("jwt_token") || "";
}

async function fetchProducts() {
  const res = await fetch(PRODUCT_API);
  products = await res.json();
}

// ดึง cart ล่าสุดของ user
async function fetchCart() {
  const token = getToken();
  if (!token) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งานตะกร้า");
    window.location = "login.html";
    return;
  }
  const res = await fetch(CART_API, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) {
    cart = null;
    return;
  }
  const data = await res.json();
  cart = data.cart;
}

// เพิ่มสินค้าเข้าตะกร้า (สร้าง cart อัตโนมัติ)
async function addToCart(product_id, amount = 1) {
  const token = getToken();
  if (!token) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งานตะกร้า");
    window.location = "login.html";
    return;
  }
  const res = await fetch(CART_API + "/add", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product_id, amount }),
  });
  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "ไม่สามารถเพิ่มสินค้าได้");
    return;
  }
  await fetchCart();
  await renderCart();
  updateCartBadge();
}

// อัปเดตจำนวนหรือเลือกจ่ายของ cartItem
async function updateCartItem(itemId, amount, selected) {
  const token = getToken();
  let body = {};
  if (amount !== undefined) body.amount = amount;
  if (selected !== undefined) body.selected = selected;
  await fetch(`${CART_API}/item/${itemId}`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  // อย่า fetchCart() ที่นี่ ให้ทำในฟังก์ชันที่เรียกต่อไปเท่านั้น เพื่อป้องกันการ fetch ซ้ำ
}

// ลบ cartItem
window.removeCartItem = async function (itemId) {
  const token = getToken();
  await fetch(`${CART_API}/item/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });
  await fetchCart();
  await renderCart();
  updateCartBadge();
};

// เปลี่ยนจำนวนสินค้า
window.changeQty = async function (itemId, diff) {
  const item = cart.cartitems.find((it) => it.id == itemId);
  if (!item) return;
  const newAmount = item.amount + diff;
  if (newAmount <= 0) {
    await removeCartItem(itemId);
    return;
  }
  await updateCartItem(itemId, newAmount, item.selected);
  await fetchCart();
  await renderCart();
  updateCartBadge();
};

// เลือกจ่ายแต่ละรายการ
window.handleSelect = async function (itemId, checked) {
  await updateCartItem(itemId, undefined, checked);
  await fetchCart();
  await renderCart();
  updateCartBadge();
};

// เลือก/ไม่เลือกทั้งหมด
document
  .getElementById("selectAll")
  .addEventListener("change", async function () {
    if (!cart || !cart.cartitems) return;
    for (let item of cart.cartitems) {
      await updateCartItem(item.id, undefined, this.checked);
    }
    await fetchCart();
    await renderCart();
    updateCartBadge();
  });

function updateSelectAll() {
  const selectAll = document.getElementById("selectAll");
  if (!cart || !cart.cartitems || cart.cartitems.length === 0) {
    selectAll.checked = false;
    selectAll.disabled = true;
    return;
  }
  selectAll.disabled = false;
  selectAll.checked = cart.cartitems.every((item) => item.selected);
}

// รวมราคารายการที่เลือก
function updateCartTotal() {
  let total = 0;
  if (cart && cart.cartitems) {
    cart.cartitems.forEach((item) => {
      if (item.selected) {
        const prod = products.find((p) => p.id === item.product_id);
        total += (prod ? prod.price : 0) * item.amount;
      }
    });
  }
  document.getElementById("cartTotal").textContent = total.toLocaleString();
}

// แสดงรายการในตะกร้า
async function renderCart() {
  const tbody = document.getElementById("cartList");
  const cartEmpty = document.getElementById("cartEmpty");
  tbody.innerHTML = "";
  if (!cart || !cart.cartitems || cart.cartitems.length === 0) {
    cartEmpty.classList.remove("d-none");
    updateCartTotal();
    updateSelectAll();
    updateCartBadge();
    return;
  }
  cartEmpty.classList.add("d-none");
  cart.cartitems.forEach((item, idx) => {
    const prod = products.find((p) => p.id === item.product_id) || {};
    tbody.innerHTML += `
      <tr>
        <td class="text-center">
          <input type="checkbox" class="form-check-input cart-check" data-id="${
            item.id
          }" ${item.selected ? "checked" : ""}>
        </td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${prod.img || ""}" alt="${prod.name || ""}">
            <span>${prod.name || "(ไม่พบชื่อสินค้า)"}</span>
          </div>
        </td>
        <td class="text-center">
          <div class="qty-group d-inline-flex align-items-center justify-content-center">
            <button type="button" class="btn btn-qty" onclick="changeQty(${
              item.id
            },-1)" ${
      item.amount <= 1 ? "disabled" : ""
    } title="ลดจำนวน">-</button>
            <span class="qty-box mx-2">${item.amount}</span>
            <button type="button" class="btn btn-qty" onclick="changeQty(${
              item.id
            },1)" title="เพิ่มจำนวน">+</button>
          </div>
        </td>
        <td class="text-end">฿${(prod.price || 0).toLocaleString()}</td>
        <td class="text-end">฿${(
          (prod.price || 0) * item.amount
        ).toLocaleString()}</td>
        <td class="text-center">
          <button type="button" class="btn btn-remove" onclick="removeCartItem(${
            item.id
          })" title="ลบสินค้า">
            <i class="bi bi-x-lg"></i>
          </button>
        </td>
      </tr>
    `;
  });
  // sync checkbox
  Array.from(document.querySelectorAll(".cart-check")).forEach((el) => {
    el.addEventListener("change", function () {
      window.handleSelect(this.dataset.id, this.checked);
    });
  });
  updateCartTotal();
  updateSelectAll();
  updateCartBadge();
}

// ชำระเงิน
document.getElementById("checkoutBtn").addEventListener("click", function () {
  if (
    !cart ||
    !cart.cartitems ||
    !cart.cartitems.some((item) => item.selected)
  ) {
    alert("กรุณาเลือกสินค้าที่ต้องการชำระเงิน");
    return;
  }
  let cartForCheckout = cart.cartitems
    .filter((item) => item.selected)
    .map((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      return {
        product_id: item.product_id,
        name: prod ? prod.name : "",
        price: prod ? prod.price : 0,
        qty: item.amount,
      };
    });
  localStorage.setItem("cart_checkout", JSON.stringify(cartForCheckout));
  window.location = "checkout.html";
});

// Badge ตะกร้า
function updateCartBadge() {
  let total = 0;
  if (cart && cart.cartitems) {
    total = cart.cartitems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = total > 0 ? total : "";
  }
}

// โหลดข้อมูลเมื่อเข้าเพจ
window.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  await fetchCart();
  await renderCart();
  updateCartBadge();
});

// เพิ่มสินค้าตะกร้า ใช้บนหน้าอื่น
window.addToCart = addToCart;
