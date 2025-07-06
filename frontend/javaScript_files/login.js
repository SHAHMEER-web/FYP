//signup

document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
        id: document.getElementById("register-id").value.trim(),
        firstName: document.getElementById("register-fname").value.trim(),
        lastName: document.getElementById("register-lname").value.trim(),
        email: document.getElementById("register-email").value.trim(),
        designation: document.getElementById("designation").value.trim().toLowerCase(),
        department: document.getElementById("department").value.trim()
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Registration successful! Admin has been notified");
            window.location.href = "login.html";
        } else {
            alert("Signup failed: " + result.message);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Server error. Try again later.');
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
            alert("Login successful!");

            // Redirect based on role
            if (data.role === "hod") {
                window.location.href = "Admin panels/admin.html";
                sessionStorage.setItem("userId", id); // ✅ Save the user ID in session
            } else if (data.role === "coordinator") {
                window.location.href = "Admin panels/coordinator.html";
                sessionStorage.setItem("userId", id); // ✅ Save the user ID in session

            } else {
                alert("Role not recognized.");
            }
        })
        .catch(err => alert("Login failed: " + err.message));
});
