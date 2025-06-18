const PRODUCT_API =
  "https://phakramcraftapi-production.up.railway.app/products";
const CATEGORY_API =
  "https://phakramcraftapi-production.up.railway.app/categories";
const WISHLIST_API =
  "https://phakramcraftapi-production.up.railway.app/wishlists";
const CART_API = "https://phakramcraftapi-production.up.railway.app/carts";
const PRODUCTS_PER_PAGE = 8;

let products = [];
let categories = [];
let wishlist = [];
let cart = null;
let currentPage = 1;

// ===== JWT & Login =====
function getToken() {
  return localStorage.getItem("jwt_token") || "";
}
function checkLoginOrRedirect() {
  const token = getToken();
  if (!token) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// ===== WISHLIST SECTION =====
async function fetchWishlist() {
  if (!checkLoginOrRedirect()) return;
  try {
    const res = await fetch(WISHLIST_API, {
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) throw new Error("โหลดสินค้าที่ถูกใจล้มเหลว");
    wishlist = await res.json();
  } catch (e) {
    wishlist = [];
  }
}
function isInWishlist(pid) {
  return wishlist.some((item) => item.product_id === pid);
}
async function toggleWishlist(pid) {
  if (!checkLoginOrRedirect()) return;
  if (!pid) {
    alert("เกิดข้อผิดพลาด: ไม่พบรหัสสินค้า");
    return;
  }
  const item = wishlist.find((w) => w.product_id === pid);
  if (item) {
    try {
      const res = await fetch(`${WISHLIST_API}/${item.wishlist_id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "ลบออกจากรายการโปรดล้มเหลว");
        return;
      }
      await fetchWishlist();
      await fetchCart();
      renderProductsPaginated(currentPage);
      updateCartBadge();
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการลบรายการโปรด");
    }
  } else {
    try {
      const res = await fetch(WISHLIST_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ product_id: pid }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "เพิ่มรายการโปรดล้มเหลว");
        return;
      }
      await fetchWishlist();
      await fetchCart();
      renderProductsPaginated(currentPage);
      updateCartBadge();
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเพิ่มรายการโปรด");
    }
  }
}

// ===== CART SECTION =====
async function fetchCart() {
  if (!checkLoginOrRedirect()) return;
  try {
    const res = await fetch(CART_API, {
      headers: { Authorization: "Bearer " + getToken() },
    });
    const data = await res.json();
    cart = data.cart;
  } catch (err) {
    cart = null;
  }
}
function findCartItemByProductId(pid) {
  if (!cart || !cart.cartitems) return null;
  return cart.cartitems.find((item) => item.product_id === pid);
}
async function addToCart(product_id, amount = 1) {
  if (!checkLoginOrRedirect()) return;
  try {
    const res = await fetch(`${CART_API}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({ product_id, amount }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "เพิ่มสินค้าล้มเหลว");
      return;
    }
    await fetchCart();
    renderProductsPaginated(currentPage);
    updateCartBadge();
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
  }
}
async function removeCartItem(itemId) {
  if (!checkLoginOrRedirect()) return;
  try {
    const res = await fetch(`${CART_API}/item/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "ลบสินค้าล้มเหลว");
      return;
    }
    await fetchCart();
    renderProductsPaginated(currentPage);
    updateCartBadge();
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการลบสินค้า");
  }
}

// ===== CATEGORY SECTION =====
async function fetchCategories() {
  try {
    const res = await fetch(CATEGORY_API);
    if (!res.ok) throw new Error("โหลดประเภทสินค้าล้มเหลว");
    categories = await res.json();
    renderCategorySelect();
  } catch (err) {
    document.getElementById("categorySelect").innerHTML = `
      <option value="all">ประเภทสินค้าทั้งหมด</option>
      <option disabled>โหลดหมวดหมู่ไม่สำเร็จ</option>
    `;
  }
}
function renderCategorySelect() {
  const select = document.getElementById("categorySelect");
  let html = `<option value="all">ประเภทสินค้าทั้งหมด</option>`;
  categories.forEach((cat) => {
    html += `<option value="${cat.name}">${cat.name}</option>`;
  });
  select.innerHTML = html;
}

// ===== PRODUCTS SECTION =====
async function fetchProducts() {
  const category = document.getElementById("categorySelect").value;
  let url = PRODUCT_API;
  if (category !== "all") {
    url += `?type=${encodeURIComponent(category)}`;
  }
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

// ===== FILTER + PAGINATION =====
function getFilteredProducts() {
  const searchVal = document
    .getElementById("searchInputProducts")
    .value.trim()
    .toLowerCase();
  const category = document.getElementById("categorySelect").value;
  let filtered = products;

  filtered = filtered.filter((p) => p.is_active !== false && p.is_active !== 0);
  if (category !== "all") {
    filtered = filtered.filter(
      (p) => p.category_name === category || p.type === category
    );
  }
  if (searchVal) {
    filtered = filtered.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(searchVal)) ||
        (p.description && p.description.toLowerCase().includes(searchVal)) ||
        (p.desc && p.desc.toLowerCase().includes(searchVal))
    );
  }
  return filtered;
}
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

// ===== ช่วยเลือกแหล่งรูปภาพ (img) ที่เหมาะสม =====
function getProductImage(p) {
  // แสดง img (ลิงก์) ถ้ามีและเป็น http/https, ถ้าไม่มีก็ใช้ placeholder
  return p.img && typeof p.img === "string" && /^https?:\/\//.test(p.img)
    ? p.img
    : "/assets/img/placeholder.png";
}

// ===== RENDER PRODUCTS =====
function renderProducts(list) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  if (list.length === 0) {
    productList.innerHTML = `<div class="col-12 text-center text-secondary py-5">ไม่พบสินค้า</div>`;
    return;
  }
  list.forEach((p) => {
    const cartItem = findCartItemByProductId(p.id);
    const inCart = !!cartItem;
    const inWishlist = isInWishlist(p.id);
    const imgSrc = getProductImage(p);
    productList.innerHTML += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="product-card h-100">
          <img src="${imgSrc}" alt="${p.name}" class="card-img-top mb-2">
          <div class="product-name fw-semibold mb-1">${p.name}</div>
          <div class="text-purple fw-bold fs-5 mb-1">฿${Number(
            p.price
          ).toLocaleString()}</div>
          <div class="small text-secondary mb-1">${
            p.category_name || p.type || ""
          }</div>
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
            }" title="${inCart ? "นำออกจากตะกร้า" : "เพิ่มตะกร้า"}"
              onclick="${
                inCart ? `removeCartItem(${cartItem.id})` : `addToCart(${p.id})`
              }">
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

// ===== Badge ตะกร้า =====
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

// ===== Modal รายละเอียดสินค้า =====
function viewDetail(pid) {
  const p = products.find((pr) => pr.id === pid);
  if (!p) return;
  const cartItem = findCartItemByProductId(p.id);
  const inCart = !!cartItem;
  const modalId = "productModal";
  if (document.getElementById(modalId))
    document.getElementById(modalId).remove();

  const imgSrc = getProductImage(p);
  const html = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="modalLabel">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <img src="${imgSrc}"
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
              isInWishlist(pid) ? "active" : ""
            }"
              onclick="toggleWishlist(${
                p.id
              });bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-heart${isInWishlist(pid) ? "-fill" : ""}"></i>
              ${isInWishlist(pid) ? "นำออกจากรายการโปรด" : "เพิ่มรายการโปรด"}
            </button>
            <button class="btn btn-action cart ${inCart ? "active" : ""}"
              onclick="${
                inCart ? `removeCartItem(${cartItem.id})` : `addToCart(${p.id})`
              };bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-cart${inCart ? "-fill" : ""}"></i>
              ${inCart ? "นำออกจากตะกร้า" : "เพิ่มตะกร้า"}
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

// ===== EVENTS & INIT =====
document
  .getElementById("categorySelect")
  .addEventListener("change", async () => {
    await fetchProducts();
    await fetchWishlist();
    await fetchCart();
    renderProductsPaginated(1);
  });
document
  .getElementById("searchInputProducts")
  .addEventListener("input", () => renderProductsPaginated(1));

window.addEventListener("DOMContentLoaded", async () => {
  if (!checkLoginOrRedirect()) return;
  await fetchCategories();
  await fetchProducts();
  await fetchWishlist();
  await fetchCart();
  renderProductsPaginated(1);
  updateCartBadge();
});
