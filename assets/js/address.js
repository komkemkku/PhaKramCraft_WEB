// === Demo ใช้ localStorage เก็บข้อมูล address ===
function getAddresses() {
  return JSON.parse(localStorage.getItem("addresses") || "[]");
}
function saveAddresses(addresses) {
  localStorage.setItem("addresses", JSON.stringify(addresses));
}

let editingIndex = null;
const addressModal = new bootstrap.Modal(
  document.getElementById("addressModal")
);
const addressForm = document.getElementById("addressForm");
const addressError = document.getElementById("addressError");

function renderAddresses() {
  const listEl = document.getElementById("addressList");
  const emptyEl = document.getElementById("addressEmpty");
  const addresses = getAddresses();
  listEl.innerHTML = "";

  if (!addresses.length) {
    emptyEl.classList.remove("d-none");
    return;
  }
  emptyEl.classList.add("d-none");
  addresses.forEach((ad, idx) => {
    listEl.innerHTML += `
      <div class="list-group-item list-group-item-address d-flex justify-content-between align-items-center p-3 mb-2">
        <div>
          <div class="address-main">${ad.fullname} <span class="ms-2 badge text-bg-light">${ad.tel}</span></div>
          <div class="text-muted small">${ad.address}, ${ad.province} ${ad.postcode}</div>
        </div>
        <div class="address-actions d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="editAddress(${idx})"><i class="bi bi-pencil"></i> แก้ไข</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteAddress(${idx})"><i class="bi bi-trash"></i> ลบ</button>
        </div>
      </div>
    `;
  });
}

window.editAddress = function (idx) {
  editingIndex = idx;
  const ad = getAddresses()[idx];
  addressForm.reset();
  addressError.classList.add("d-none");
  document.getElementById("addressModalLabel").textContent = "แก้ไขที่อยู่";
  document.getElementById("fullname").value = ad.fullname;
  document.getElementById("tel").value = ad.tel;
  document.getElementById("address").value = ad.address;
  document.getElementById("province").value = ad.province;
  document.getElementById("postcode").value = ad.postcode;
  addressModal.show();
};

window.deleteAddress = function (idx) {
  if (confirm("ยืนยันการลบที่อยู่นี้?")) {
    const addresses = getAddresses();
    addresses.splice(idx, 1);
    saveAddresses(addresses);
    renderAddresses();
  }
};

document.getElementById("addAddressBtn").onclick = function () {
  editingIndex = null;
  addressForm.reset();
  addressError.classList.add("d-none");
  document.getElementById("addressModalLabel").textContent =
    "เพิ่มที่อยู่จัดส่ง";
  addressModal.show();
};

addressForm.onsubmit = function (e) {
  e.preventDefault();
  addressError.classList.add("d-none");

  const fullname = document.getElementById("fullname").value.trim();
  const tel = document.getElementById("tel").value.trim();
  const address = document.getElementById("address").value.trim();
  const province = document.getElementById("province").value.trim();
  const postcode = document.getElementById("postcode").value.trim();

  if (!fullname || !tel || !address || !province || !postcode) {
    addressError.textContent = "กรุณากรอกข้อมูลให้ครบถ้วน";
    addressError.classList.remove("d-none");
    return;
  }
  if (!/^\d{10}$/.test(tel)) {
    addressError.textContent = "เบอร์โทรศัพท์ต้องมี 10 หลัก";
    addressError.classList.remove("d-none");
    return;
  }
  if (!/^\d{5}$/.test(postcode)) {
    addressError.textContent = "รหัสไปรษณีย์ต้องมี 5 หลัก";
    addressError.classList.remove("d-none");
    return;
  }

  const addresses = getAddresses();
  if (editingIndex !== null) {
    addresses[editingIndex] = { fullname, tel, address, province, postcode };
  } else {
    addresses.push({ fullname, tel, address, province, postcode });
  }
  saveAddresses(addresses);
  addressModal.hide();
  renderAddresses();
};

document.addEventListener("DOMContentLoaded", function () {
  renderAddresses();
  // เพิ่ม email profile (mock)
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  document.getElementById("profileEmail").textContent = profile.email || "";
});
