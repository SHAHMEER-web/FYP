{
    (function () { if (!window.chatbase || window.chatbase("getState") !== "initialized") { window.chatbase = (...arguments) => { if (!window.chatbase.q) { window.chatbase.q = [] } window.chatbase.q.push(arguments) }; window.chatbase = new Proxy(window.chatbase, { get(target, prop) { if (prop === "q") { return target.q } return (...args) => target(prop, ...args) } }) } const onLoad = function () { const script = document.createElement("script"); script.src = "https://www.chatbase.co/embed.min.js"; script.id = "lmZKLoSEgc25EIwc2u3jw"; script.domain = "www.chatbase.co"; document.body.appendChild(script) }; if (document.readyState === "complete") { onLoad() } else { window.addEventListener("load", onLoad) } })();
}




// Predefined credentials for HOD, Coordinator, and Super Admin
const users = {
    HOD: {
        id: "12345",
        password: "hod123"
    },
    Coordinator: {
        id: "67890",
        password: "coord123"
    },
    SuperAdmin: {
        id: "2278",
        password: "superadmin"
    }
};

// Check if the user is already logged in
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const loginTime = sessionStorage.getItem("loginTime");
    const currentTime = Date.now();

    // Redirect to login if not logged in or session expired (10 seconds timeout)
    if (!isLoggedIn || !loginTime || currentTime - loginTime > 10000) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("loginTime");
        sessionStorage.removeItem("role");
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
    }
}

// Call the function to enforce login check on page load
if (window.location.pathname.includes("admin.html")) {
    checkLoginStatus();
}

// Handle login form submission
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent form submission

            const id = document.getElementById("signin-id").value.trim();
            const password = document.getElementById("signin-password").value.trim();
            const errorMessage = document.getElementById("errorMessage");

            // Validate credentials
            if (
                (id === users.HOD.id && password === users.HOD.password) ||
                (id === users.Coordinator.id && password === users.Coordinator.password) ||
                (id === users.SuperAdmin.id && password === users.SuperAdmin.password)
            ) {
                // Store login status and role in sessionStorage
                let role = "";
                if (id === users.HOD.id) role = "HOD";
                if (id === users.Coordinator.id) role = "Coordinator";
                if (id === users.SuperAdmin.id) role = "SuperAdmin";

                sessionStorage.setItem("isLoggedIn", true);
                sessionStorage.setItem("role", role);

                // Redirect based on role
                if (role === "SuperAdmin") {
                    window.location.href = "Admin panels/super_admin.html";
                } else {
                    window.location.href = "Admin panels/admin.html";
                }
            } else {
                // Show error message
                if (errorMessage) {
                    errorMessage.textContent = "Invalid ID or Password!";
                    errorMessage.classList.remove("d-none");
                } else {
                    alert("Invalid ID or Password!"); // Fallback error message
                }
            }
        });
    }
});

// Reset session if navigating back to login.html after 10 seconds
if (window.location.pathname.includes("login.html")) {
    const loginTime = sessionStorage.getItem("loginTime");
    const currentTime = Date.now();

    if (loginTime && currentTime - loginTime > 3000) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("loginTime");
        sessionStorage.removeItem("role");
        alert("Session expired. Please log in again.");
    }
}




// =================================================== HOD Message ==================================================
// DOM Element
const adminContent = document.getElementById("adminContent");

// Function to load and display data from localStorage
const displayData = () => {
    let savedContent = JSON.parse(localStorage.getItem("dynamicContent")) || [];

    adminContent.innerHTML = ""; // Clear current content

    if (savedContent.length === 0) {
        adminContent.innerHTML = "<p class='text-muted text-center'>No data available.</p>";
        return;
    }

    savedContent.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card my-3 p-3 shadow-sm";

        card.innerHTML = `
                        <div class="d-flex align-items-start">
                            <div class="content-container">
                                <h4>${item.title}</h4>
                                    <p style="text-align: justify;">${item.description}</p>
                                        <p class="fw-bold">${item.author}</p>
                            </div>
                            <div class="image-container ms-3">
                                <img src="${item.image}" alt="Uploaded Image" class="rounded img-fluid">
                            </div>
                        </div> `;

        adminContent.appendChild(card);
    });
};

// Initialize content on page load
document.addEventListener("DOMContentLoaded", displayData);




// =============================================== Announcments & News ==================================================



document.addEventListener("DOMContentLoaded", function () {
    showAnnouncement();
    updateBanner(); // Ensure banner updates when loaded
});

// Function to show the announcement
function showAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    const modal = overlay.querySelector('.announcement-modal');

    overlay.classList.add('show');
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

// Function to close the announcement
function closeAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    const modal = overlay.querySelector('.announcement-modal');

    modal.classList.remove('show');
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 300);
}

// Function to update banner content
function updateBanner() {
    const bannerContent = document.getElementById('announcementText');

    fetch("http://localhost:3000/api/announcements")
        .then(res => res.json())
        .then(data => {
            if (data.length) {
                bannerContent.innerHTML = data.map(item => {
                    const date = new Date(item.date).toLocaleString();
                    const role = item.role?.toUpperCase() || "UNKNOWN";
                    return `
            <div class="announcement-item">
              <strong>[${role}]</strong> ${item.message}
              <span class="timestamp">(${date})</span>
            </div>
          `;
                }).join('');
            } else {
                bannerContent.innerHTML = "<p>No announcements</p>";
            }
        })
        .catch(err => {
            console.error("❌ Error loading announcements:", err);
            bannerContent.innerHTML = "<p>Error loading announcements</p>";
        });
}

// Update banner when clicking outside
document.getElementById('announcementOverlay').addEventListener('click', function (event) {
    if (event.target === this) {
        closeAnnouncement();
    }
});

// ================================================== Coordinators Images ================================================


document.addEventListener("DOMContentLoaded", function () {
    const coordinatorsContainer = document.getElementById("coordinatorsContainer");

    function getCoordinators() {
        return JSON.parse(localStorage.getItem("coordinators")) || [];
    }

    function renderCoordinators() {
        coordinatorsContainer.innerHTML = "";
        const coordinators = getCoordinators();

        coordinators.forEach((coordinator) => {
            const col = document.createElement("div");
            col.classList.add("col-lg-4", "col-md-6", "col-sm-12", "d-flex", "justify-content-center", "mb-3");

            col.innerHTML = `
    <div class="card" style="width: 10rem; border: none; overflow: hidden;">
        <img src="${coordinator.imageURL}" class="card-img-top img-fluid" style="height: 130px;">
            <div class="card-body text-center">
                <h5 class="card-title fw-bold fs-6">${coordinator.name}</h5>
                <p class="card-text">${coordinator.designation}</p>
            </div>
    </div>
                                  `;
            coordinatorsContainer.appendChild(col);
        });
    }

    renderCoordinators();
});

fetch('/api/hello')
    .then(res => res.json())
    .then(data => console.log(data.message));


// Signup
function signup() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
        .then(res => res.text())
        .then(alert);
}


//Login
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.text())
        .then(alert);
}





