{
    (function () { if (!window.chatbase || window.chatbase("getState") !== "initialized") { window.chatbase = (...arguments) => { if (!window.chatbase.q) { window.chatbase.q = [] } window.chatbase.q.push(arguments) }; window.chatbase = new Proxy(window.chatbase, { get(target, prop) { if (prop === "q") { return target.q } return (...args) => target(prop, ...args) } }) } const onLoad = function () { const script = document.createElement("script"); script.src = "https://www.chatbase.co/embed.min.js"; script.id = "lmZKLoSEgc25EIwc2u3jw"; script.domain = "www.chatbase.co"; document.body.appendChild(script) }; if (document.readyState === "complete") { onLoad() } else { window.addEventListener("load", onLoad) } })();
}


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

// Society

document.getElementById("addButtonSociety").addEventListener("click", async () => {
    const section = document.getElementById("sectionSelectSociety").value;
    const description = document.getElementById("descriptionSociety").value.trim();
    const imageFile = document.getElementById("imageInputSociety").files[0];

    if (!section || !description || !imageFile) {
        alert("All fields are required.");
        return;
    }

    const formData = new FormData();
    formData.append("section", section);
    formData.append("description", description);
    formData.append("image", imageFile);

    try {
        const response = await fetch("http://localhost:3000/api/societies", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert("Image added successfully!");
            // Optionally refresh the section display
        } else {
            alert("Upload failed: " + result.message);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Server error. Try again later.");
    }
});




