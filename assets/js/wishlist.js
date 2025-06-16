const WISHLIST_API = "http://localhost:3000/wishlists";
const PRODUCTS_API = "http://localhost:3000/products";

let wishlist = []; // { wishlist_id, product_id, ... }
let products = []; // { id, name, img, price, desc, ... }

function getToken() {
  return localStorage.getItem("jwt_token") || "";
}

// --- โหลด products (จาก API จริง) ---
async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS_API, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    });
    if (!res.ok) throw new Error("โหลดรายการสินค้าไม่สำเร็จ");
    products = await res.json();
  } catch (e) {
    alert(e.message);
    products = [];
  }
}

// --- โหลด wishlist ของผู้ใช้ ---
async function fetchWishlist() {
  try {
    const res = await fetch(WISHLIST_API, {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    });
    if (!res.ok) throw new Error("โหลดรายการถูกใจล้มเหลว");
    wishlist = await res.json();
  } catch (e) {
    alert(e.message);
    wishlist = [];
  }
}

// --- หาสินค้าใน wishlist ด้วย product_id ---
function findWishlistByProductId(pid) {
  return wishlist.find((item) => item.product_id === pid);
}

// --- เพิ่มสินค้าเข้าถูกใจ ---
async function addWishlist(product_id) {
  try {
    const res = await fetch(WISHLIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({ product_id }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "เพิ่มสินค้าถูกใจล้มเหลว");
    }
    const data = await res.json();
    wishlist.unshift(data);
    renderWishlist();
  } catch (e) {
    alert(e.message);
  }
}

// --- ลบสินค้าถูกใจออก ---
async function deleteWishlist(wishlist_id) {
  try {
    const res = await fetch(`${WISHLIST_API}/${wishlist_id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "ลบสินค้าถูกใจล้มเหลว");
    }
    wishlist = wishlist.filter((item) => item.wishlist_id !== wishlist_id);
    renderWishlist();
  } catch (e) {
    alert(e.message);
  }
}

// --- ปุ่ม toggle (กดถูกใจ/ยกเลิก) ---
window.toggleWishlist = async function (pid) {
  const wish = findWishlistByProductId(pid);
  if (wish) {
    await deleteWishlist(wish.wishlist_id);
  } else {
    await addWishlist(pid);
  }
};

// --- แสดง wishlist ---
function renderWishlist() {
  const container = document.getElementById("wishlistContainer");
  const empty = document.getElementById("emptyWishlist");
  container.innerHTML = "";

  // match กับ products (หาก product_id หาไม่เจอ ให้ skip)
  let items = wishlist
    .map((w) => {
      const p = products.find((p) => p.id === w.product_id);
      return p ? { ...p, wishlist_id: w.wishlist_id } : null;
    })
    .filter(Boolean);

  if (items.length === 0) {
    container.classList.add("d-none");
    empty.classList.remove("d-none");
    return;
  }
  container.classList.remove("d-none");
  empty.classList.add("d-none");

  items.forEach((p) => {
    container.innerHTML += `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="product-card h-100">
          <img src="${p.img}" alt="${p.name}" class="card-img-top mb-2">
          <div class="product-name">${p.name}</div>
          <div class="product-price">฿${Number(p.price).toLocaleString()}</div>
          <div class="mb-2" style="min-height:40px">${
            p.desc || p.description || ""
          }</div>
          <div class="mt-auto d-flex align-items-center gap-1">
            <button class="btn btn-action heart active" title="นำออกจากรายการถูกใจ" onclick="toggleWishlist(${
              p.id
            })">
              <i class="bi bi-heart-fill"></i>
            </button>
            <button class="btn btn-action remove" title="ลบออก" onclick="toggleWishlist(${
              p.id
            })">
              <i class="bi bi-x-circle"></i> ลบ
            </button>
            <button class="btn-detail" onclick="viewDetail(${
              p.id
            })">ดูรายละเอียด</button>
          </div>
        </div>
      </div>
    `;
  });
}

// --- Modal แสดงรายละเอียดสินค้า (เหมือนเดิม) ---
window.viewDetail = function (pid) {
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
            p.img
          }" class="w-100 rounded-top" style="object-fit:cover;max-height:240px;" alt="${
    p.name
  }">
          <div class="modal-header">
            <h5 class="modal-title text-purple" id="modalLabel">${p.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${p.desc || p.description || ""}</p>
            <div class="fs-5 fw-semibold text-purple">ราคา ฿${Number(
              p.price
            ).toLocaleString()}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
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
    });
};

// --- โหลดทั้งหมดและ render ---
async function initWishlistPage() {
  await fetchProducts(); // โหลดสินค้าจริง
  await fetchWishlist(); // โหลดรายการถูกใจจริง
  renderWishlist();
}

window.addEventListener("DOMContentLoaded", initWishlistPage);
