const ADDRESS_API = "http://localhost:3000/addresses";
const PROFILE_API = "http://localhost:3000/users/me/info";

let addresses = [];
let editingId = null;

// ===== API CRUD =====

// ดึงข้อมูลโปรไฟล์ผู้ใช้
async function fetchProfile() {
  const token = localStorage.getItem("jwt_token");
  if (!token) return null;
  try {
    const res = await fetch(PROFILE_API, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

// แสดงข้อมูลอีเมลที่ sidebar (id="profileEmail")
async function renderProfileSidebar() {
  const user = await fetchProfile();
  const emailEl = document.getElementById("profileEmail");
  if (emailEl) {
    emailEl.textContent = user && user.email ? user.email : "";
  }
}

// เรียกใน onload
document.addEventListener("DOMContentLoaded", renderProfileSidebar);

// โหลดที่อยู่ทั้งหมด
async function fetchAddresses() {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(ADDRESS_API, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) return [];
  return await res.json();
}

// เพิ่มที่อยู่ใหม่
async function addAddress(addressObj) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(ADDRESS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(addressObj),
  });
  return res.ok ? await res.json() : Promise.reject(await res.json());
}

// แก้ไขที่อยู่
async function updateAddress(id, addressObj) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(`${ADDRESS_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(addressObj),
  });
  return res.ok ? await res.json() : Promise.reject(await res.json());
}

// ลบที่อยู่
async function deleteAddress(id) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(`${ADDRESS_API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });
  return res.ok ? await res.json() : Promise.reject(await res.json());
}

// ===== RENDER UI =====

async function renderAddresses() {
  const listEl = document.getElementById("addressList");
  const emptyEl = document.getElementById("addressEmpty");
  listEl.innerHTML = "";
  try {
    addresses = await fetchAddresses();
  } catch (e) {
    listEl.innerHTML =
      '<div class="text-danger">โหลดข้อมูลที่อยู่ล้มเหลว</div>';
    return;
  }
  if (!addresses.length) {
    emptyEl.classList.remove("d-none");
    return;
  }
  emptyEl.classList.add("d-none");
  addresses.forEach((ad, i) => {
    listEl.innerHTML += `
      <div class="list-group-item list-group-item-address d-flex justify-content-between align-items-center p-3 mb-2">
        <div>
          <div class="address-main">${ad.fullname} <span class="ms-2 badge text-bg-light">${ad.tel}</span></div>
          <div class="text-muted small">${ad.address}, ${ad.province} ${ad.postcode}</div>
        </div>
        <div class="address-actions d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="editAddress(${i})"><i class="bi bi-pencil"></i> แก้ไข</button>
          <button class="btn btn-outline-danger btn-sm" onclick="confirmDeleteAddress('${ad.id}', '${ad.fullname}', ${i})"><i class="bi bi-trash"></i> ลบ</button>
        </div>
      </div>
    `;
  });
}

// ===== MODAL (Bootstrap 5) =====

const addressModal = new bootstrap.Modal(
  document.getElementById("addressModal")
);
const addressForm = document.getElementById("addressForm");
const addressError = document.getElementById("addressError");

// ----- ปุ่ม "เพิ่มที่อยู่" -----
document.getElementById("addAddressBtn").onclick = function () {
  editingId = null;
  addressForm.reset();
  addressError.classList.add("d-none");
  document.getElementById("addressModalLabel").textContent =
    "เพิ่มที่อยู่จัดส่ง";
  addressModal.show();
};

// ----- ปุ่ม "แก้ไข" -----
window.editAddress = function (idx) {
  editingId = addresses[idx].id;
  const ad = addresses[idx];
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

// ====== ลบ (SweetAlert2) ======
window.confirmDeleteAddress = function (id, name, idx) {
  Swal.fire({
    title: "ต้องการลบที่อยู่นี้?",
    html: `<b>${name}</b><br>${addresses[idx].address}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ใช่, ลบเลย",
    cancelButtonText: "ยกเลิก",
    customClass: {
      confirmButton: "btn btn-danger me-2",
      cancelButton: "btn btn-secondary",
    },
    buttonsStyling: false,
  }).then((result) => {
    if (result.isConfirmed) {
      deleteAddress(id)
        .then(() => {
          Swal.fire("ลบเรียบร้อย!", "", "success");
          renderAddresses();
        })
        .catch(() => Swal.fire("เกิดข้อผิดพลาด", "", "error"));
    }
  });
};

// ===== FORM SUBMIT =====
addressForm.onsubmit = async function (e) {
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

  const payload = { fullname, tel, address, province, postcode };
  try {
    if (editingId) {
      await updateAddress(editingId, payload);
    } else {
      await addAddress(payload);
    }
    addressModal.hide();
    renderAddresses();
  } catch (err) {
    addressError.textContent = err?.error || "บันทึกข้อมูลล้มเหลว";
    addressError.classList.remove("d-none");
  }
};

// ---- INITIAL ----
document.addEventListener("DOMContentLoaded", function () {
  renderAddresses();
});
