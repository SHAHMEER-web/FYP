const roles = { HOD: "hod", Coordinator: "coordinator", SuperAdmin: "superadmin" };

// Generate OTP based on role
function generateOTP(role) {
    let otp = Math.floor(1000 + Math.random() * 9000);
    if (role === roles.HOD) return `hod-${otp}`;
    if (role === roles.Coordinator) return `coord-${otp}`;
    return otp.toString();
}

// Handle registration
document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = document.getElementById("register-email").value.trim();
    let id = document.getElementById("register-id").value.trim();
    let designation = document.getElementById("designation").value.trim().toLowerCase();

    if (!email || !id || !designation) {
        alert("Please fill in all required fields.");
        return;
    }

    let otp = generateOTP(designation);
    localStorage.setItem(`userEmail_${id}`, email);
    localStorage.setItem(`userID_${id}`, id);
    localStorage.setItem(`userOTP_${id}`, otp);
    localStorage.setItem(`userRole_${id}`, designation);

    alert(`Registration Successful! Your password is: ${otp}`);
    window.location.href = "login.html";
});

// Handle login
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let id = document.getElementById("signin-id").value.trim();
    let password = document.getElementById("signin-password").value.trim();

    let storedOTP = localStorage.getItem(`userOTP_${id}`);
    let role = localStorage.getItem(`userRole_${id}`);

    if (storedOTP && password === storedOTP) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("loginTime", Date.now());
        sessionStorage.setItem("userRole", role);

        alert("Login Successful!");

        if (role === roles.HOD) {
            window.location.href = "Admin panels/admin.html";
        } else if (role === roles.Coordinator) {
            window.location.href = "Admin panels/coordinator.html";
        }
    } else {
        alert("Invalid ID or Password!");
    }
});

// Function to check login status
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const loginTime = sessionStorage.getItem("loginTime");
    const currentTime = Date.now();

    // Redirect to login if session expired (10 seconds timeout) or user is not logged in
    if (!isLoggedIn || !loginTime || currentTime - loginTime > 10000) {
        forceLogout();
    } else {
        history.pushState(null, null, window.location.href); // Prevent back navigation
    }
}

// Function to force logout (used for back button and session expiration)
function forceLogout() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("loginTime");
    sessionStorage.removeItem("userRole");

    alert("Session expired. Please log in again.");
    history.replaceState(null, null, "login.html"); // Block forward navigation
    window.location.replace("login.html");
}

// Prevent navigating forward after logout or pressing back
function blockForwardNavigation() {
    history.pushState(null, null, window.location.href);

    window.addEventListener("popstate", function () {
        forceLogout(); // Log out when Back is pressed
    });
}

// Call login check on admin and coordinator pages
if (window.location.pathname.includes("admin.html") || window.location.pathname.includes("coordinator.html")) {
    checkLoginStatus();
}

// Run forward block function on page load
document.addEventListener("DOMContentLoaded", blockForwardNavigation);

// Reset session if navigating back to login.html after session expires
if (window.location.pathname.includes("login.html")) {
    const loginTime = sessionStorage.getItem("loginTime");
    const currentTime = Date.now();

    if (loginTime && currentTime - loginTime > 10000) {
        forceLogout();
    }
}
