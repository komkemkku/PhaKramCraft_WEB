function gotoPage(page) {
  alert("ตัวอย่าง: ไปยังหน้า " + page);
}

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
