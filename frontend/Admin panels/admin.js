// Check if the user is already logged in
function checkLoginStatus() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  sessionStorage.setItem("isLoggedIn", "true");
  sessionStorage.setItem("userId", id);
  // sessionStorage.setItem("userRole", data.role);
  sessionStorage.setItem("loginTime", Date.now());
  if (isLoggedIn) {
    // Redirect to login page if not logged in
    window.location.href = "../login.html"; // Replace with your login page URL
  }
}

// Logout function
function logout() {
  sessionStorage.removeItem("isLoggedIn");
  window.location.href = "../login.html"; // Redirect to login page
}

// Delete Account
document.getElementById("deleteMyAccount").addEventListener("click", async () => {
  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    alert("You're not logged in.");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete your account?");
  if (!confirmDelete) return;
  window.location.href = "../login.html";
  try {
    const response = await fetch(`/api/delete-user/${userId}`, {
      method: 'DELETE',
    });

    const contentType = response.headers.get("content-type");
    let result;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error("Unexpected server response");
    }

    if (response.ok) {
      alert("Your account has been deleted.");
      sessionStorage.clear();
      window.location.href = "login.html";
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Server error. Try again later.");
  }
});

// Add Faculty
document.addEventListener("DOMContentLoaded", function () {
  // form submit listener here
  document.getElementById("facultyForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("facultyName").value;
    const designation = document.getElementById("facultyDesignation").value;
    const department = document.getElementById("facultySection").value;
    const imageFile = document.getElementById("facultyImage").files[0];
    const cvFile = document.getElementById("facultyCv").files[0];

    if (!imageFile || !cvFile) {
      alert("Please upload both image and CV.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("department", department);
    formData.append("designation", designation);
    formData.append("image", imageFile);
    formData.append("cv", cvFile);


    try {
      const response = await fetch("http://localhost:3000/api/faculty", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        alert("Faculty added successfully!");
        location.reload();
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error. Try again later.");
    }
  });
});

async function loadFaculty() {
  const department = document.getElementById("adminFacultySection").value;
  const container = document.getElementById("facultyList");
  container.innerHTML = ""; // Clear current faculty

  try {
    const res = await fetch(`http://localhost:3000/api/faculty?department=${department}`);
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = "<p>No faculty found for this department.</p>";
      return;
    }

    data.forEach(faculty => {
      const card = document.createElement("div");
      card.className = "col-md-4 mb-3";
      card.innerHTML = `
          <div class="card h-100 shadow-sm">
            ${faculty.image ? `<img src="data:image/png;base64,${faculty.image}" class="card-img-top" style="height:200px; object-fit:cover;">` : ''}
            <div class="card-body">
              <h5 class="card-title">${faculty.name}</h5>
              <p class="card-text"><strong>${faculty.designation}</strong><br>${faculty.department}</p>
              ${faculty.cv ? `<a href="data:application/pdf;base64,${faculty.cv}" download="${faculty.name}-CV.pdf" class="btn btn-outline-primary btn-sm">Download CV</a>
              <button class="btn btn-danger btn-sm" onclick="deleteFaculty(${faculty.id})">Delete</button>` : ''}
            </div>
          </div>
        `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Error loading faculty:", err);
    container.innerHTML = "<p>Failed to load faculty.</p>";
  }
}

// 🔁 Load faculty when dropdown changes
document.getElementById("adminFacultySection").addEventListener("change", loadFaculty);

// 🔁 Load default on page load
document.addEventListener("DOMContentLoaded", loadFaculty);

function deleteFaculty(id) {
  if (confirm("Are you sure you want to delete this faculty member?")) {
    fetch(`/api/faculty/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(result => {
        if (result.message === "Faculty deleted successfully.") {
          alert("Faculty deleted!");
          loadFaculty(); // Reload the list
        } else {
          alert("Failed to delete faculty.");
        }
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Server error. Try again later.");
      });
  }
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



document.addEventListener("DOMContentLoaded", checkLoginStatus);
