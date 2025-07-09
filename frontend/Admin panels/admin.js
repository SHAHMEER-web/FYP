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


function deleteFaculty(section, index) {
  let facultyData = JSON.parse(localStorage.getItem('facultyData')) || { CS: [], AI: [], SE: [] };
  facultyData[section].splice(index, 1);
  localStorage.setItem('facultyData', JSON.stringify(facultyData));
  loadFaculty();
}



