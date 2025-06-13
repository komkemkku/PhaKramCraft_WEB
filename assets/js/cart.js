// ตัวอย่างสินค้า (สามารถดึงจาก API หรือไฟล์กลาง)
const products = [
  {
    id: 1,
    name: "ผ้าครามลายดั้งเดิม",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: 950,
  },
  {
    id: 2,
    name: "ผ้าครามสีน้ำเงินเข้ม",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 890,
  },
  {
    id: 3,
    name: "ผ้าครามผสมลายสวย",
    img: "https://images.unsplash.com/photo-1542089363-2c5a79ca8c37?auto=format&fit=crop&w=400&q=80",
    price: 1090,
  },
];

// โครงสร้าง cart = [{id, qty, checked}]
let cart = JSON.parse(localStorage.getItem("cart")) || [
  { id: 1, qty: 1, checked: true },
  { id: 2, qty: 2, checked: true },
];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  const tbody = document.getElementById("cartList");
  const cartEmpty = document.getElementById("cartEmpty");
  tbody.innerHTML = "";
  if (cart.length === 0) {
    cartEmpty.classList.remove("d-none");
    updateCartTotal();
    updateSelectAll();
    updateCartBadge();
    return;
  }
  cartEmpty.classList.add("d-none");
  cart.forEach((item, idx) => {
    const prod = products.find((p) => p.id === item.id);
    if (!prod) return;
    tbody.innerHTML += `
      <tr>
        <td class="text-center">
          <input type="checkbox" class="form-check-input cart-check" data-index="${idx}" ${
      item.checked ? "checked" : ""
    }>
        </td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${prod.img}" alt="${prod.name}">
            <span>${prod.name}</span>
          </div>
        </td>
        <td class="text-center">
          <div class="qty-group d-inline-flex align-items-center justify-content-center">
            <button type="button" class="btn btn-qty" onclick="changeQty(${idx},-1)" ${
      item.qty <= 1 ? "disabled" : ""
    } title="ลดจำนวน">-</button>
            <span class="qty-box mx-2">${item.qty}</span>
            <button type="button" class="btn btn-qty" onclick="changeQty(${idx},1)" title="เพิ่มจำนวน">+</button>
          </div>
        </td>
        <td class="text-end">฿${prod.price.toLocaleString()}</td>
        <td class="text-end">฿${(prod.price * item.qty).toLocaleString()}</td>
        <td class="text-center">
          <button type="button" class="btn btn-remove" onclick="removeCart(${idx})" title="ลบสินค้า">
            <i class="bi bi-x-lg"></i>
          </button>
        </td>
      </tr>
    `;
  });
  // event สำหรับ checkbox
  Array.from(document.querySelectorAll(".cart-check")).forEach((el) => {
    el.addEventListener("change", function () {
      cart[+this.dataset.index].checked = this.checked;
      saveCart();
      updateCartTotal();
      updateSelectAll();
      updateCartBadge();
    });
  });
  updateCartTotal();
  updateSelectAll();
  updateCartBadge();
}

window.changeQty = function (idx, diff) {
  cart[idx].qty += diff;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  saveCart();
  renderCart();
};

window.removeCart = function (idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
};

function updateCartTotal() {
  let total = 0;
  cart.forEach((item, idx) => {
    if (item.checked) {
      const prod = products.find((p) => p.id === item.id);
      total += (prod ? prod.price : 0) * item.qty;
    }
  });
  document.getElementById("cartTotal").textContent = total.toLocaleString();
}

document.getElementById("selectAll").addEventListener("change", function () {
  cart.forEach((item) => (item.checked = this.checked));
  saveCart();
  renderCart();
});

function updateSelectAll() {
  const selectAll = document.getElementById("selectAll");
  if (cart.length === 0) {
    selectAll.checked = false;
    selectAll.disabled = true;
    return;
  }
  selectAll.disabled = false;
  selectAll.checked = cart.every((item) => item.checked);
}

document.getElementById("checkoutBtn").addEventListener("click", function () {
  let checkedCart = cart.filter((item) => item.checked);
  if (checkedCart.length === 0) {
    alert("กรุณาเลือกสินค้าที่ต้องการชำระเงิน");
    return;
  }
  // เตรียมข้อมูลสินค้าสำหรับ checkout
  let cartForCheckout = checkedCart.map((item) => {
    const prod = products.find((p) => p.id === item.id);
    return {
      id: item.id,
      name: prod ? prod.name : "",
      price: prod ? prod.price : 0,
      qty: item.qty,
    };
  });
  localStorage.setItem("cart_checkout", JSON.stringify(cartForCheckout));
  // ลบออกจาก cart หลัก
  cart = cart.filter((item) => !item.checked);
  saveCart();
  renderCart();
  updateCartBadge();
  // ไปหน้า checkout
  window.location = "checkout.html";
});

// ไปหน้าต่างๆ (demo)
function gotoPage(page) {
  if (page === "wishlist") window.location = "wishlist.html";
  else if (page === "cart") window.location = "cart.html";
  else alert("ไปยังหน้า: " + page);
}

// Badge บนตะกร้า
function updateCartBadge() {
  let cartArr = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  if (cartArr.length > 0) {
    if (typeof cartArr[0] === "object") {
      total = cartArr.reduce((sum, item) => sum + (item.qty || 1), 0);
    } else {
      total = cartArr.length;
    }
  }
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = total > 0 ? total : "";
  }
}
// เรียกเมื่อโหลดหน้าและหลัง update ตะกร้า
renderCart();
updateCartBadge();
