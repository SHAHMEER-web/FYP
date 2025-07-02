//  ============================================ Admin page ============================================================

// Check if the user is already logged in
function checkLoginStatus() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
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
const inputField = document.getElementById('inputField');
const saveButton = document.getElementById('saveButton');
const todoList = document.getElementById('todoList');

// Function to load items from localStorage
const loadItems = () => {
  const items = JSON.parse(localStorage.getItem('scrollItems')) || [];
  todoList.innerHTML = ''; // Clear the list
  items.forEach((item, index) => {
    addTodoItemToDOM(item, index);
  });
};

// Function to add a new item to the DOM
const addTodoItemToDOM = (text, index) => {
  const li = document.createElement('li');
  li.className = 'todo-item';

  const span = document.createElement('span');
  span.textContent = text;

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    deleteItem(index);
  });

  li.appendChild(span);
  li.appendChild(deleteButton);
  todoList.appendChild(li);
};

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


document.addEventListener('DOMContentLoaded', loadFaculty);

document.getElementById('facultyForm').addEventListener('submit', function (e) {
  e.preventDefault();

  let section = document.getElementById('facultySection').value;
  let name = document.getElementById('name').value;
  let designation = document.getElementById('designation').value;
  let imageFile = document.getElementById('image').files[0];
  let cvFile = document.getElementById('cv').files[0];

  if (!imageFile || !cvFile) {
    alert('Please upload both an image and a CV.');
    return;
  }

  let reader1 = new FileReader();
  let reader2 = new FileReader();
  let imageBase64 = "";

  reader1.onload = function (e) {
    imageBase64 = e.target.result;
    reader2.readAsDataURL(cvFile);
  };

  reader2.onload = function (e) {
    let cvBase64 = e.target.result;

    let facultyData = JSON.parse(localStorage.getItem('facultyData')) || { CS: [], AI: [], SE: [] };
    let facultyMember = { name, designation, image: imageBase64, cv: cvBase64 };

    facultyData[section].push(facultyMember);
    localStorage.setItem('facultyData', JSON.stringify(facultyData));

    loadFaculty();
    document.getElementById('facultyForm').reset();
  };

  reader1.readAsDataURL(imageFile);
});

function loadFaculty() {
  let selectedSection = document.getElementById('adminFacultySection').value;
  let facultyData = JSON.parse(localStorage.getItem('facultyData')) || { CS: [], AI: [], SE: [] };
  let facultyList = facultyData[selectedSection] || [];

  let facultyContainer = document.getElementById('facultyList');
  facultyContainer.innerHTML = "";

  facultyList.forEach((faculty, index) => {
    let li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    li.innerHTML = `
  <div>
    <img src="${faculty.image}" width="50" height="50" class="rounded-circle me-2">
      <strong>${faculty.name}</strong> - ${faculty.designation}
      <a href="${faculty.cv}" target="_blank" class="btn btn-sm btn-primary">View Profile</a>
  </div>
  <button class="btn btn-danger btn-sm" onclick="deleteFaculty('${selectedSection}', ${index})">Delete</button>
                          `;

    facultyContainer.appendChild(li);
  });
}

function deleteFaculty(section, index) {
  let facultyData = JSON.parse(localStorage.getItem('facultyData')) || { CS: [], AI: [], SE: [] };
  facultyData[section].splice(index, 1);
  localStorage.setItem('facultyData', JSON.stringify(facultyData));
  loadFaculty();
}





