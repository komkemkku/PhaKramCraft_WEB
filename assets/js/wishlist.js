// ตัวอย่างสินค้า (ในงานจริงอาจดึงจากฐานข้อมูลหรือไฟล์กลาง)
const products = [
  {
    id: 1,
    name: "ผ้าครามลายดั้งเดิม",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: 950,
    desc: "ผ้าครามทอมือ ลายดั้งเดิม จากกลุ่มชุมชน",
  },
  {
    id: 2,
    name: "ผ้าครามสีน้ำเงินเข้ม",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    price: 890,
    desc: "ผ้าครามย้อมครามแท้ สีเข้มสวยงาม",
  },
  {
    id: 3,
    name: "ผ้าครามผสมลายสวย",
    img: "https://images.unsplash.com/photo-1542089363-2c5a79ca8c37?auto=format&fit=crop&w=400&q=80",
    price: 1090,
    desc: "ผ้าครามทอมือ ผสมผสานลวดลายสมัยใหม่",
  },
];

// อ่าน/บันทึก wishlist จาก localStorage
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[1,2]"); // เริ่มต้นมี id 1,2 เพื่อทดสอบ

function saveWishlist() {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function renderWishlist() {
  const container = document.getElementById("wishlistContainer");
  const empty = document.getElementById("emptyWishlist");
  container.innerHTML = "";
  let items = products.filter((p) => wishlist.includes(p.id));
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
          <div class="product-price">฿${p.price.toLocaleString()}</div>
          <div class="mb-2" style="min-height:40px">${p.desc}</div>
          <div class="mt-auto d-flex align-items-center gap-1">
            <button class="btn btn-action heart active" title="นำออกจากรายการถูกใจ" onclick="removeWishlist(${
              p.id
            })">
              <i class="bi bi-heart-fill"></i>
            </button>
            <button class="btn btn-action remove" title="ลบออก" onclick="removeWishlist(${
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

window.removeWishlist = function (pid) {
  wishlist = wishlist.filter((id) => id !== pid);
  saveWishlist();
  renderWishlist();
};

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
            <p>${p.desc}</p>
            <div class="fs-5 fw-semibold text-purple">ราคา ฿${p.price.toLocaleString()}</div>
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

// ไปหน้าต่างๆ (demo)
function gotoPage(page) {
  alert("ไปยังหน้า: " + page);
}

renderWishlist();

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
