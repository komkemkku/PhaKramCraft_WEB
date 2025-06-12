// สินค้าตัวอย่าง (เพิ่มหมวดหมู่ type)
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
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 1090,
    desc: "ผ้าครามทอมือ ผสมผสานลวดลายสมัยใหม่",
    type: "ผ้าคลุมไหล่",
  },
  {
    id: 4,
    name: "ผ้าครามครามแท้พิเศษ",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 1190,
    desc: "เนื้อผ้านุ่ม ใส่สบาย ลายครามแท้",
    type: "เสื้อ",
  },
  {
    id: 5,
    name: "ผ้าครามสีน้ำเงินเข้ม",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 890,
    desc: "ผ้าครามย้อมครามแท้ สีเข้มสวยงาม",
    type: "ผ้าซิ่น",
  },
  ,
  {
    id: 6,
    name: "ผ้าครามสีน้ำเงินเข้ม",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 890,
    desc: "ผ้าครามย้อมครามแท้ สีเข้มสวยงาม",
    type: "ผ้าซิ่น",
  },
  ,
  {
    id: 7,
    name: "ผ้าครามสีน้ำเงินเข้ม",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 890,
    desc: "ผ้าครามย้อมครามแท้ สีเข้มสวยงาม",
    type: "ผ้าซิ่น",
  },
  ,
  {
    id: 8,
    name: "ผ้าครามสีน้ำเงินเข้ม",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 890,
    desc: "ผ้าครามย้อมครามแท้ สีเข้มสวยงาม",
    type: "ผ้าซิ่น",
  },
];

// อ่านข้อมูลจาก LocalStorage
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
let currentFilter = "all";

// แสดงสินค้า
function renderProducts(list = products) {
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
  applyFilters();
}

// เพิ่มตะกร้า
function toggleCart(pid) {
  if (cart.includes(pid)) {
    cart = cart.filter((id) => id !== pid);
  } else {
    cart.push(pid);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  applyFilters();
}

// Badge ตะกร้า
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  badge.textContent = cart.length > 0 ? cart.length : "";
}

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
      applyFilters();
    });
}

// demo ไปหน้าอื่นๆ
function gotoPage(page) {
  alert("ตัวอย่าง: ไปยังหน้า " + page);
}

// ค้นหาและ filter
function applyFilters() {
  const searchVal = document
    .getElementById("searchInput")
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
  renderProducts(filtered);
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document
  .getElementById("categorySelect")
  .addEventListener("change", applyFilters);

// โหลดสินค้าเริ่มต้น
renderProducts();
