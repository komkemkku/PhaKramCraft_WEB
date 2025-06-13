document
  .getElementById("showNotificationBtn")
  .addEventListener("click", function () {
    const toast = new bootstrap.Toast(
      document.getElementById("notificationToast"),
      { delay: 7000 }
    );
    toast.show();
  });
