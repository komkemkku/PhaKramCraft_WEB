let products = [];
let categories = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

// โหลดประเภทสินค้าจาก API
async function fetchCategories() {
  try {
    const res = await fetch("http://localhost:3000/categories");
    if (!res.ok) throw new Error("โหลดประเภทสินค้าล้มเหลว");
    categories = await res.json(); // [{ id, name }, ...]
    renderCategorySelect();
  } catch (err) {
    // ถ้าโหลดไม่สำเร็จจะใส่ default option ไว้
    document.getElementById("categorySelect").innerHTML = `
      <option value="all">ประเภทสินค้าทั้งหมด</option>
      <option disabled>โหลดหมวดหมู่ไม่สำเร็จ</option>
    `;
  }
}

// เติม option ประเภทสินค้าใน select
function renderCategorySelect() {
  const select = document.getElementById("categorySelect");
  let html = `<option value="all">ประเภทสินค้าทั้งหมด</option>`;
  categories.forEach((cat) => {
    html += `<option value="${cat.name}">${cat.name}</option>`;
  });
  select.innerHTML = html;
}

// โหลดสินค้าตามประเภทที่เลือก
async function fetchProducts() {
  const category = document.getElementById("categorySelect").value;
  let url = "http://localhost:3000/products";
  if (category !== "all") {
    url += `?type=${encodeURIComponent(category)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("โหลดสินค้าล้มเหลว");
    products = await res.json();
    applyFilters(); // กรองด้วย search อีกรอบ (ถ้ามี)
  } catch (err) {
    document.getElementById("productList").innerHTML =
      '<div class="col-12 text-center text-danger py-5">ไม่สามารถโหลดสินค้าจากเซิร์ฟเวอร์ได้</div>';
    products = [];
  }
}

// render สินค้า
function renderProducts(list = products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  if (!list.length) {
    productList.innerHTML = `<div class="col-12 text-center text-secondary py-5">ไม่พบสินค้า</div>`;
    return;
  }
  list.forEach((p) => {
    const inCart = cart.includes(p.id);
    const inWishlist = wishlist.includes(p.id);
    productList.innerHTML += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="product-card h-100">
          <img src="${p.img}" alt="${p.name}" class="card-img-top mb-2">
          <div class="product-name fw-semibold mb-1">${p.name}</div>
          <div class="text-purple fw-bold fs-5 mb-1">฿${
            p.price?.toLocaleString?.() ?? p.price
          }</div>
          <div class="small text-secondary mb-1">${p.type || ""}</div>
          <div class="mb-2 small" style="min-height:40px">${
            p.description || ""
          }</div>
          <div class="mt-auto d-flex align-items-center gap-1">
            <button class="btn btn-action heart ${
              inWishlist ? "active" : ""
            }" title="ถูกใจ" onclick="toggleWishlist(${p.id})">
              <i class="bi bi-heart${inWishlist ? "-fill" : ""}"></i>
            </button>
            <button class="btn btn-action cart ${
              inCart ? "active" : ""
            }" title="เพิ่มตะกร้า" onclick="toggleCart(${p.id})">
              <i class="bi bi-cart${inCart ? "-fill" : ""}"></i>
              ${inCart ? "นำออก" : "เพิ่มตะกร้า"}
            </button>
            <button class="btn-detail" onclick="viewDetail(${
              p.id
            })">ดูรายละเอียด</button>
          </div>
        </div>
      </div>
    `;
  });
  updateCartBadge();
}

// Wishlist/cart
function toggleWishlist(pid) {
  if (wishlist.includes(pid)) {
    wishlist = wishlist.filter((id) => id !== pid);
  } else {
    wishlist.push(pid);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  applyFilters();
}
function toggleCart(pid) {
  if (cart.includes(pid)) {
    cart = cart.filter((id) => id !== pid);
  } else {
    cart.push(pid);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  applyFilters();
}

// Badge cart
function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = Array.isArray(cart) ? cart.length : 0;
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = total > 0 ? total : "";
  }
}

// Modal รายละเอียดสินค้า
function viewDetail(pid) {
  const p = products.find((pr) => pr.id === pid);
  if (!p) return;
  const modalId = "productModal";
  if (document.getElementById(modalId))
    document.getElementById(modalId).remove();

  // ดึงชื่อหมวดหมู่
  const categoryName = getCategoryName(p.category_id);

  const html = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="modalLabel">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <img src="${
            p.img
          }" class="w-100 rounded-top" style="object-fit:cover;max-height:240px;" alt="${
    p.name
  }">
          <div class="modal-header">
            <h5 class="modal-title text-purple" id="modalLabel">${p.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${p.description}</p>
            <div class="small text-secondary mb-2">${categoryName}</div>
            <div class="fs-5 fw-semibold text-purple">ราคา ฿${p.price.toLocaleString()}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-action heart ${
              wishlist.includes(pid) ? "active" : ""
            }" onclick="toggleWishlist(${
    p.id
  });bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-heart${
                wishlist.includes(pid) ? "-fill" : ""
              }"></i> ${
    wishlist.includes(pid) ? "นำออกจากรายการโปรด" : "เพิ่มรายการโปรด"
  }
            </button>
            <button class="btn btn-action cart ${
              cart.includes(pid) ? "active" : ""
            }" onclick="toggleCart(${
    p.id
  });bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-cart${cart.includes(pid) ? "-fill" : ""}"></i> ${
    cart.includes(pid) ? "นำออกจากตะกร้า" : "เพิ่มตะกร้า"
  }
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
  document
    .getElementById(modalId)
    .addEventListener("hidden.bs.modal", function () {
      document.getElementById(modalId).remove();
      applyFilters();
    });
}

// helper function สำหรับแปลง id เป็นชื่อ
function getCategoryName(category_id) {
  const cat = categories.find((c) => c.id === category_id);
  return cat ? cat.name : "";
}

// ฟิลเตอร์ และค้นหา
function applyFilters() {
  const searchVal = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  let filtered = products;

  // Search โดยไม่ต้อง reload สินค้าจาก API
  if (searchVal) {
    filtered = filtered.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(searchVal)) ||
        (p.desc && p.desc.toLowerCase().includes(searchVal))
    );
  }
  renderProducts(filtered);
}

// Event listener
document
  .getElementById("categorySelect")
  .addEventListener("change", fetchProducts);
document.getElementById("searchInput").addEventListener("input", applyFilters);

// โหลดทุกอย่างเมื่อเข้าเว็บครั้งแรก
window.addEventListener("DOMContentLoaded", () => {
  fetchCategories().then(() => {
    fetchProducts();
  });
  updateCartBadge();
});
