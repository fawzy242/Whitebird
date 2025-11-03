$(document).ready(function() {
    $("#loginForm").on("submit", function(e) {
        e.preventDefault();

        const username = $("#username").val().trim();
        const password = $("#password").val().trim();
        const rememberMe = $("#rememberMe").is(":checked");

        // Reset alert
        $("#loginAlert").addClass("d-none");

        // Validasi sederhana
        if (!username || !password) {
            $("#loginAlert").text("Username and password are required").removeClass("d-none");
            return;
        }

        // Contoh AJAX login ke API (sesuaikan endpoint)
        $.ajax({
            url: "/api/auth/login", // endpoint backend
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password, rememberMe }),
            success: function(res) {
                if (res.success) {
                    // Redirect ke home atau load halaman via root container
                    if (typeof loadPage === "function") {
                        loadPage("home.html"); // pakai fungsi di index.js
                    } else {
                        window.location.href = "home.html";
                    }
                } else {
                    $("#loginAlert").text(res.message || "Invalid username or password").removeClass("d-none");
                }
            },
            error: function(err) {
                $("#loginAlert").text("Login failed. Please try again.").removeClass("d-none");
            }
        });
    });
});
