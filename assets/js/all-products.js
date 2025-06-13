// สินค้าตัวอย่าง (สามารถนำเข้าจากภายนอกได้)
const products = [
  {
    id: 1,
    name: "ผ้าครามลายดั้งเดิม",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: 950,
    desc: "ผ้าครามทอมือ ลายดั้งเดิม จากกลุ่มชุมชน",
    type: "ผ้าพันคอ",
  },
  {
    id: 2,
    name: "ผ้าครามสีน้ำเงินเข้ม",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 890,
    desc: "ผ้าครามย้อมครามแท้ สีเข้มสวยงาม",
    type: "ผ้าซิ่น",
  },
  {
    id: 3,
    name: "ผ้าครามผสมลายสวย",
    img: "https://images.unsplash.com/photo-1542089363-2c5a79ca8c37?auto=format&fit=crop&w=400&q=80",
    price: 1090,
    desc: "ผ้าครามทอมือ ผสมผสานลวดลายสมัยใหม่",
    type: "ผ้าคลุมไหล่",
  },
  {
    id: 4,
    name: "ผ้าครามครามแท้พิเศษ",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    price: 1190,
    desc: "เนื้อผ้านุ่ม ใส่สบาย ลายครามแท้",
    type: "เสื้อ",
  },
  // เพิ่มสินค้าให้ครบ 10-20 ชิ้นเพื่อทดสอบ pagination ได้
  {
    id: 5,
    name: "ผ้าครามลายใหม่",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: 900,
    desc: "ผ้าครามลายใหม่ 2024",
    type: "ผ้าซิ่น",
  },
  {
    id: 6,
    name: "ผ้าคลุมไหล่ครามแท้",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 1050,
    desc: "ผ้าคลุมไหล่ครามแท้",
    type: "ผ้าคลุมไหล่",
  },
  {
    id: 7,
    name: "ผ้าพันคอครามฟ้า",
    img: "https://images.unsplash.com/photo-1542089363-2c5a79ca8c37?auto=format&fit=crop&w=400&q=80",
    price: 790,
    desc: "ผ้าพันคอผืนบาง ลายฟ้า",
    type: "ผ้าพันคอ",
  },
  {
    id: 8,
    name: "เสื้อครามแฟชั่น",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    price: 1450,
    desc: "เสื้อครามทรงแฟชั่น",
    type: "เสื้อ",
  },
  {
    id: 9,
    name: "ผ้าซิ่นสีน้ำเงิน",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: 800,
    desc: "ผ้าซิ่นสีน้ำเงินเข้ม",
    type: "ผ้าซิ่น",
  },
  {
    id: 10,
    name: "ผ้าพันคอครามขาว",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 680,
    desc: "ผ้าพันคอสีครามขาว",
    type: "ผ้าพันคอ",
  },
];

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
const PRODUCTS_PER_PAGE = 8;
let currentPage = 1;

// Filter & Paginate
function getFilteredProducts() {
  const searchVal = document
    .getElementById("searchInputProducts")
    .value.trim()
    .toLowerCase();
  const category = document.getElementById("categorySelect").value;
  let filtered = products;
  if (category !== "all") {
    filtered = filtered.filter((p) => p.type === category);
  }
  if (searchVal) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchVal) ||
        p.desc.toLowerCase().includes(searchVal)
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

  // Pagination
  const pagin = document.getElementById("pagination");
  pagin.innerHTML = "";
  if (totalPage <= 1) return;
  pagin.innerHTML += `<li class="page-item${
    currentPage === 1 ? " disabled" : ""
  }"><a class="page-link" href="#" onclick="gotoPageNum(${
    currentPage - 1
  });return false;">«</a></li>`;
  for (let i = 1; i <= totalPage; i++) {
    pagin.innerHTML += `<li class="page-item${
      i === currentPage ? " active" : ""
    }"><a class="page-link" href="#" onclick="gotoPageNum(${i});return false;">${i}</a></li>`;
  }
  pagin.innerHTML += `<li class="page-item${
    currentPage === totalPage ? " disabled" : ""
  }"><a class="page-link" href="#" onclick="gotoPageNum(${
    currentPage + 1
  });return false;">»</a></li>`;
  updateCartBadge();
}
window.gotoPageNum = function (page) {
  renderProductsPaginated(page);
};

// สร้างสินค้า
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
          <img src="${p.img}" alt="${p.name}" class="card-img-top mb-2">
          <div class="product-name">${p.name}</div>
          <div class="product-price">฿${p.price.toLocaleString()}</div>
          <div class="small text-secondary mb-2">${p.type}</div>
          <div class="mb-2" style="min-height:40px">${p.desc}</div>
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
  // ถ้า cart เป็น array ของ object {id, qty, ...}
  let total = 0;
  if (cart.length > 0) {
    if (typeof cart[0] === "object") {
      total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    } else {
      // ถ้าเป็น array ของ id เฉยๆ
      total = cart.length;
    }
  }
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = total > 0 ? total : "";
  }
}
// เรียกเมื่อโหลดหน้าและหลัง update ตะกร้า
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
            p.img
          }" class="w-100 rounded-top" style="object-fit:cover;max-height:240px;" alt="${
    p.name
  }">
          <div class="modal-header">
            <h5 class="modal-title text-purple" id="modalLabel">${p.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>${p.desc}</p>
            <div class="small text-secondary mb-2">${p.type}</div>
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
      renderProductsPaginated(currentPage);
    });
}

// demo ไปหน้าอื่นๆ
function gotoPage(page) {
  alert("ตัวอย่าง: ไปยังหน้า " + page);
}

// กรองและค้นหา
document
  .getElementById("searchInputProducts")
  .addEventListener("input", () => renderProductsPaginated(1));
document
  .getElementById("categorySelect")
  .addEventListener("change", () => renderProductsPaginated(1));

// โหลดสินค้าเริ่มต้น
renderProductsPaginated(1);
