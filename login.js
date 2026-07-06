const API_URL =
  "https://script.google.com/macros/s/AKfycbxSrTngCSq8H7qitmGlAEck-M9Ny0IIT9pjgeZXD5x9gEjX_f60iTXxscvxKc9tMh-d5w/exec";

document.getElementById("loginBtn").addEventListener("click", async () => {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "login",
            username,
            password
        })
    });

    const result = await response.json();

    if (result.success) {

        localStorage.setItem("loggedInUser", result.username);
localStorage.setItem("userRole", result.role);
localStorage.setItem("sessionToken", result.token);

window.location.href = "admin.html";

    } else {

        document.getElementById("loginError").textContent =
            "Invalid username or password.";

    }

});