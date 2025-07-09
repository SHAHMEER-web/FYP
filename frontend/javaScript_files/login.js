//signup

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    console.log("Button works")

    const id = document.getElementById("register-id").value.trim();
    const firstName = document.getElementById("register-fname").value.trim();
    const lastName = document.getElementById("register-lname").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const designation = document.getElementById("designation").value.trim();
    const department = document.getElementById("department").value.trim();
    const imageFile = document.getElementById("register-image").files[0];

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = async function () {
        const base64Image = reader.result; // data:image/png;base64,...

        const data = {
            id,
            firstName,
            lastName,
            email,
            designation,
            department,
            image: base64Image, // Send base64 to backend
        };

        try {
            const response = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Registration successful!");
                window.location.href = "login.html";
            } else {
                alert("Signup failed: " + result.message);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Server error. Try again later.");
        }
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        alert("Please upload an image.");
    }
});

// login
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("signin-id").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
    })
        .then(res => res.json())
        .then(data => {
            console.log("login response:", data);
            alert("Login successful!");

            const role = data.role?.toLowerCase().trim();

            // Redirect based on role
            if (role === "hod") {
                sessionStorage.setItem("userId", id); // ✅ Save the user ID in session
                window.location.href = "Admin panels/admin.html";
            } else if (role === "coordinator") {
                sessionStorage.setItem("userId", id); // ✅ Save the user ID in session
                window.location.href = "Admin panels/coordinator.html";

            } else {
                alert("Role not recognized.");
            }
        })
        .catch(err => alert("Login failed: " + err.message));
});
