//  ============================================ Admin page ============================================================

// Check if the user is already logged in
function checkLoginStatus() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  sessionStorage.setItem("isLoggedIn", "true");
  sessionStorage.setItem("userId", id);
  // sessionStorage.setItem("userRole", data.role);
  sessionStorage.setItem("loginTime", Date.now());

  console.log("User ID:", id);
  // console.log("User Role:", data.role);
  console.log("Login Time", Date.now());



  if (!isLoggedIn) {
    window.location.href = "../login.html";
  }
}

// Logout function
function logout() {
  sessionStorage.removeItem("isLoggedIn");
  window.location.href = "../login.html";
}

// Call checkLoginStatus on page load
document.addEventListener("DOMContentLoaded", checkLoginStatus);



// ================================ generate news and anouncement ===========================


// Function to save a new item
const saveItem = () => {
  const text = inputField.value.trim();
  if (text) {
    const items = JSON.parse(localStorage.getItem('scrollItems')) || [];
    items.push(text);
    localStorage.setItem('scrollItems', JSON.stringify(items));
    addTodoItemToDOM(text, items.length - 1);
    inputField.value = '';
  } else {
    alert('Please enter some text!');
  }
};

// Function to delete an item
const deleteItem = (index) => {
  const items = JSON.parse(localStorage.getItem('scrollItems')) || [];
  items.splice(index, 1);
  localStorage.setItem('scrollItems', JSON.stringify(items));
  loadItems(); // Reload the list
};

// Event listener for the "Add" button
saveButton.addEventListener('click', saveItem);

// Load items on page load
loadItems();


//=============================================== Add timetable pdf =========================================================


function deleteFaculty(section, index) {
  let facultyData = JSON.parse(localStorage.getItem('facultyData')) || { CS: [], AI: [], SE: [] };
  facultyData[section].splice(index, 1);
  localStorage.setItem('facultyData', JSON.stringify(facultyData));
  loadFaculty();
}



