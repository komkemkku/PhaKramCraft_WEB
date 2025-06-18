const PRODUCT_API =
  "https://phakramcraftapi-production.up.railway.app/products";
const CATEGORY_API =
  "https://phakramcraftapi-production.up.railway.app/categories";
const WISHLIST_API =
  "https://phakramcraftapi-production.up.railway.app/wishlists";
const CART_API = "https://phakramcraftapi-production.up.railway.app/carts";

let products = [];
let categories = [];
let wishlist = [];
let cart = null;

function getToken() {
  return localStorage.getItem("jwt_token") || "";
}

function handleApiAuthError(err) {
  if (
    err &&
    typeof err === "object" &&
    ((err.error &&
      (err.error.includes("Token") || err.error.includes("token"))) ||
      (typeof err === "string" &&
        (err.includes("Token") || err.includes("token"))))
  ) {
    Swal.fire({
      toast: true,
      icon: "warning",
      title: "กรุณาเข้าสู่ระบบ",
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      allowOutsideClick: false,
      willClose: () => {
        window.location.href = "/login.html";
      },
    });
    return true;
  }
  return false;
}

function showLoginToast() {
  Swal.fire({
    toast: true,
    icon: "warning",
    title: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
    position: "top-end",
    showConfirmButton: true,
    confirmButtonText: "เข้าสู่ระบบ",
    timer: 3000,
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: (toast) => {
      toast.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    },
    willClose: () => {
      window.location.href = "login.html";
    },
  });
}

function checkLoginOrRedirect() {
  const token = getToken();
  if (!token) {
    showLoginToast();
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
    if (!res.ok) {
      const err = await res.json();
      if (handleApiAuthError(err)) return;
      throw new Error("โหลดสินค้าที่ถูกใจล้มเหลว");
    }
    wishlist = await res.json();
  } catch (e) {
    if (handleApiAuthError(e)) return;
    wishlist = [];
  }
}
function isInWishlist(pid) {
  return wishlist.some((item) => item.product_id === pid);
}
async function toggleWishlist(pid) {
  if (!checkLoginOrRedirect()) return;
  if (!pid) {
    Swal.fire("เกิดข้อผิดพลาด", "ไม่พบรหัสสินค้า", "error");
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
        if (handleApiAuthError(err)) return;
        Swal.fire("ล้มเหลว", err.error || "ลบออกจากรายการโปรดล้มเหลว", "error");
        return;
      }
      await fetchWishlist();
      await fetchCart();
      applyFilters();
      updateCartBadge();
    } catch (e) {
      if (handleApiAuthError(e)) return;
      Swal.fire("เกิดข้อผิดพลาด", "ลบรายการโปรดล้มเหลว", "error");
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
        if (handleApiAuthError(err)) return;
        Swal.fire("ล้มเหลว", err.error || "เพิ่มรายการโปรดล้มเหลว", "error");
        return;
      }
      await fetchWishlist();
      await fetchCart();
      applyFilters();
      updateCartBadge();
    } catch (e) {
      if (handleApiAuthError(e)) return;
      Swal.fire("เกิดข้อผิดพลาด", "เพิ่มรายการโปรดล้มเหลว", "error");
    }
  }
}

// ===== CART SECTION (API จริง) =====
async function fetchCart() {
  if (!checkLoginOrRedirect()) return;
  try {
    const res = await fetch(CART_API, {
      headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) {
      const err = await res.json();
      if (handleApiAuthError(err)) return;
      throw new Error("โหลดตะกร้าสินค้าล้มเหลว");
    }
    const data = await res.json();
    cart = data.cart;
  } catch (err) {
    if (handleApiAuthError(err)) return;
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
      if (handleApiAuthError(err)) return;
      Swal.fire("ล้มเหลว", err.error || "เพิ่มสินค้าล้มเหลว", "error");
      return;
    }
    await fetchCart();
    applyFilters();
    updateCartBadge();
  } catch (err) {
    if (handleApiAuthError(err)) return;
    Swal.fire("เกิดข้อผิดพลาด", "เพิ่มสินค้าไม่สำเร็จ", "error");
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
      if (handleApiAuthError(err)) return;
      Swal.fire("ล้มเหลว", err.error || "ลบสินค้าล้มเหลว", "error");
      return;
    }
    await fetchCart();
    applyFilters();
    updateCartBadge();
  } catch (err) {
    if (handleApiAuthError(err)) return;
    Swal.fire("เกิดข้อผิดพลาด", "ลบสินค้าไม่สำเร็จ", "error");
  }
}
window.handleAddToCart = async function (productId) {
  await addToCart(productId);
};
window.handleRemoveCart = async function (itemId) {
  await removeCartItem(itemId);
};

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
    applyFilters();
  } catch (err) {
    document.getElementById("productList").innerHTML =
      '<div class="col-12 text-center text-danger py-5">ไม่สามารถโหลดสินค้าจากเซิร์ฟเวอร์ได้</div>';
    products = [];
  }
}

// ===== RENDER PRODUCTS =====
function renderProducts(list = products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  if (!list.length) {
    productList.innerHTML = `<div class="col-12 text-center text-secondary py-5">ไม่พบสินค้า</div>`;
    return;
  }
  list.forEach((p) => {
    const cartItem = findCartItemByProductId(p.id);
    const inCart = !!cartItem;
    const inWishlist = isInWishlist(p.id);

    // ======= เปลี่ยนตรงนี้ให้ใช้ลิงก์ img ถ้ามี =======
    const imgSrc =
      p.img && typeof p.img === "string" && p.img.startsWith("http")
        ? p.img
        : "/assets/img/placeholder.png";
    // ===============================================

    const name = p.name ? p.name : "(ไม่ทราบชื่อ)";
    const price =
      p.price !== undefined
        ? typeof p.price === "number"
          ? p.price.toLocaleString()
          : p.price
        : "-";
    const description = p.description || p.desc || "";
    productList.innerHTML += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="product-card h-100">
          <img src="${imgSrc}" alt="${name}" class="card-img-top mb-2">
          <div class="product-name fw-semibold mb-1">${name}</div>
          <div class="text-purple fw-bold fs-5 mb-1">฿${price}</div>
          <div class="small text-secondary mb-1">${p.type || ""}</div>
          <div class="mb-2 small" style="min-height:40px">${description}</div>
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
                inCart
                  ? `window.handleRemoveCart(${cartItem.id})`
                  : `window.handleAddToCart(${p.id})`
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

// ===== CART BADGE =====
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

// ===== PRODUCT DETAIL MODAL =====
function viewDetail(pid) {
  if (!checkLoginOrRedirect()) return;
  const p = products.find((pr) => pr.id === pid);
  if (!p) return;
  const cartItem = findCartItemByProductId(p.id);
  const inCart = !!cartItem;
  const modalId = "productModal";
  if (document.getElementById(modalId))
    document.getElementById(modalId).remove();

  // ======= เปลี่ยนตรงนี้ให้ใช้ลิงก์ img ถ้ามี =======
  const imgSrc =
    p.img && typeof p.img === "string" && p.img.startsWith("http")
      ? p.img
      : "/assets/img/placeholder.png";
  // ===============================================

  const name = p.name ? p.name : "(ไม่ทราบชื่อ)";
  const description = p.description || p.desc || "";
  const price =
    p.price !== undefined
      ? typeof p.price === "number"
        ? p.price.toLocaleString()
        : p.price
      : "-";
  const categoryName = getCategoryName(p.category_id);

  const html = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="modalLabel">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <img src="${imgSrc}" class="w-100 rounded-top" style="object-fit:cover;max-height:240px;" alt="${name}">
          <div class="modal-header">
            <h5 class="modal-title text-purple" id="modalLabel">${name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${description}</p>
            <div class="small text-secondary mb-2">${categoryName}</div>
            <div class="fs-5 fw-semibold text-purple">ราคา ฿${price}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-action heart ${
              isInWishlist(pid) ? "active" : ""
            }" onclick="toggleWishlist(${
    p.id
  });bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-heart${isInWishlist(pid) ? "-fill" : ""}"></i> ${
    isInWishlist(pid) ? "นำออกจากรายการโปรด" : "เพิ่มรายการโปรด"
  }
            </button>
            <button class="btn btn-action cart ${
              inCart ? "active" : ""
            }" onclick="${
    inCart
      ? `window.handleRemoveCart(${cartItem.id})`
      : `window.handleAddToCart(${p.id})`
  };bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide()">
              <i class="bi bi-cart${inCart ? "-fill" : ""}"></i> ${
    inCart ? "นำออกจากตะกร้า" : "เพิ่มตะกร้า"
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

// ===== Helper แปลง id หมวดหมู่เป็นชื่อ =====
function getCategoryName(category_id) {
  const cat = categories.find((c) => c.id === category_id);
  return cat ? cat.name : "";
}

// ===== SEARCH / FILTER =====
function applyFilters() {
  const searchVal = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  let filtered = products;
  filtered = filtered.filter((p) => p.is_active !== false);
  if (searchVal) {
    filtered = filtered.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(searchVal)) ||
        (p.desc && p.desc.toLowerCase().includes(searchVal)) ||
        (p.description && p.description.toLowerCase().includes(searchVal))
    );
  }
  renderProducts(filtered);
}

// ===== EVENTS & INIT =====
document
  .getElementById("categorySelect")
  .addEventListener("change", async () => {
    await fetchProducts();
    await fetchWishlist();
    await fetchCart();
    applyFilters();
  });
document.getElementById("searchInput").addEventListener("input", applyFilters);

window.addEventListener("DOMContentLoaded", async () => {
  if (!checkLoginOrRedirect()) return;
  await fetchCategories();
  await fetchProducts();
  await fetchWishlist();
  await fetchCart();
  applyFilters();
  updateCartBadge();
});
