// Fungsi untuk load halaman HTML ke root
function loadPage(pageUrl) {
    $("#root").load(pageUrl);
}

// Saat document ready, load halaman login
$(document).ready(function() {
    loadPage('/public/Product/Features/login/Login.html'); // path menyesuaikan folder public
});

// Contoh fungsi untuk pindah ke home
function goToHome() {
    loadPage('/public/Product/Features/home/Home.html');
}
