let products = [];
let categories = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
const PRODUCTS_PER_PAGE = 8;
let currentPage = 1;

// โหลดหมวดหมู่จาก API
async function fetchCategories() {
  try {
    const res = await fetch("http://localhost:3000/categories");
    if (!res.ok) throw new Error("โหลดประเภทสินค้าล้มเหลว");
    categories = await res.json(); // [{ id, name }]
    renderCategorySelect();
  } catch (err) {
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

// โหลดสินค้าทั้งหมด (กรองฝั่ง client)
async function fetchProducts() {
  let url = "http://localhost:3000/products";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("โหลดสินค้าล้มเหลว");
    products = await res.json();
    renderProductsPaginated(1);
  } catch (err) {
    document.getElementById("productList").innerHTML =
      '<div class="col-12 text-center text-danger py-5">ไม่สามารถโหลดสินค้าจากเซิร์ฟเวอร์ได้</div>';
    products = [];
    document.getElementById("pagination").innerHTML = "";
  }
}

// กรองประเภท + ค้นหา ฝั่ง client
function getFilteredProducts() {
  const searchVal = document
    .getElementById("searchInputProducts")
    .value.trim()
    .toLowerCase();
  const category = document.getElementById("categorySelect").value;
  let filtered = products;
  // กรองประเภท (โดยใช้ category_name)
  if (category !== "all") {
    filtered = filtered.filter((p) => p.category_name === category);
  }
  // กรองค้นหา
  if (searchVal) {
    filtered = filtered.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(searchVal)) ||
        (p.description && p.description.toLowerCase().includes(searchVal))
    );
  }
  return filtered;
}

// Render + Pagination
function renderProductsPaginated(page = 1) {
  const filtered = getFilteredProducts();
  const totalPage = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  currentPage = Math.max(1, Math.min(page, totalPage || 1));
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageItems = filtered.slice(start, start + PRODUCTS_PER_PAGE);
  renderProducts(pageItems);

  // Pagination UI
  const pagin = document.getElementById("pagination");
  pagin.innerHTML = "";
  if (totalPage <= 1) return;
  pagin.innerHTML += `<li class="page-item${
    currentPage === 1 ? " disabled" : ""
  }">
    <a class="page-link" href="#" onclick="gotoPageNum(${
      currentPage - 1
    });return false;">«</a></li>`;
  for (let i = 1; i <= totalPage; i++) {
    pagin.innerHTML += `<li class="page-item${
      i === currentPage ? " active" : ""
    }">
      <a class="page-link" href="#" onclick="gotoPageNum(${i});return false;">${i}</a></li>`;
  }
  pagin.innerHTML += `<li class="page-item${
    currentPage === totalPage ? " disabled" : ""
  }">
    <a class="page-link" href="#" onclick="gotoPageNum(${
      currentPage + 1
    });return false;">»</a></li>`;
  updateCartBadge();
}
window.gotoPageNum = function (page) {
  renderProductsPaginated(page);
};

// แสดงสินค้าแต่ละชิ้น
function renderProducts(list) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  if (list.length === 0) {
    productList.innerHTML = `<div class="col-12 text-center text-secondary py-5">ไม่พบสินค้า</div>`;
    return;
  }
  list.forEach((p) => {
    const inCart = cart.includes(p.id);
    const inWishlist = wishlist.includes(p.id);
    productList.innerHTML += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="product-card h-100">
          <img src="${
            p.img || "https://via.placeholder.com/400x300?text=No+Image"
          }" alt="${p.name}" class="card-img-top mb-2">
          <div class="product-name fw-semibold mb-1">${p.name}</div>
          <div class="text-purple fw-bold fs-5 mb-1">฿${Number(
            p.price
          ).toLocaleString()}</div>
          <div class="small text-secondary mb-1">${p.category_name || ""}</div>
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

// กดใจ
function toggleWishlist(pid) {
  if (wishlist.includes(pid)) {
    wishlist = wishlist.filter((id) => id !== pid);
  } else {
    wishlist.push(pid);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  renderProductsPaginated(currentPage);
}

// เพิ่มตะกร้า
function toggleCart(pid) {
  if (cart.includes(pid)) {
    cart = cart.filter((id) => id !== pid);
  } else {
    cart.push(pid);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderProductsPaginated(currentPage);
}

// Badge ตะกร้า
function updateCartBadge() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  if (cart.length > 0) {
    if (typeof cart[0] === "object") {
      total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    } else {
      total = cart.length;
    }
  }
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = total > 0 ? total : "";
  }
}
updateCartBadge();

// Modal รายละเอียดสินค้า
function viewDetail(pid) {
  const p = products.find((pr) => pr.id === pid);
  if (!p) return;
  const modalId = "productModal";
  if (document.getElementById(modalId))
    document.getElementById(modalId).remove();

  const html = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="modalLabel">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <img src="${
            p.img || "https://via.placeholder.com/400x300?text=No+Image"
          }"
               class="w-100 rounded-top" style="object-fit:cover;max-height:240px;" alt="${
                 p.name
               }">
          <div class="modal-header">
            <h5 class="modal-title text-purple" id="modalLabel">${p.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${p.description || ""}</p>
            <div class="small text-secondary mb-2">${
              p.category_name || ""
            }</div>
            <div class="fs-5 fw-semibold text-purple">ราคา ฿${Number(
              p.price
            ).toLocaleString()}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-action heart ${
              wishlist.includes(pid) ? "active" : ""
            }"
              onclick="toggleWishlist(${
                p.id
              });bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-heart${
                wishlist.includes(pid) ? "-fill" : ""
              }"></i>
              ${
                wishlist.includes(pid)
                  ? "นำออกจากรายการโปรด"
                  : "เพิ่มรายการโปรด"
              }
            </button>
            <button class="btn btn-action cart ${
              cart.includes(pid) ? "active" : ""
            }"
              onclick="toggleCart(${
                p.id
              });bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-cart${cart.includes(pid) ? "-fill" : ""}"></i>
              ${cart.includes(pid) ? "นำออกจากตะกร้า" : "เพิ่มตะกร้า"}
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
      renderProductsPaginated(currentPage);
    });
}

// Event listeners (เปลี่ยนหมวด/ค้นหา)
document
  .getElementById("categorySelect")
  .addEventListener("change", () => renderProductsPaginated(1));
document
  .getElementById("searchInputProducts")
  .addEventListener("input", () => renderProductsPaginated(1));

// โหลดข้อมูลเริ่มต้น
window.addEventListener("DOMContentLoaded", () => {
  fetchCategories().then(() => fetchProducts());
  updateCartBadge();
});
