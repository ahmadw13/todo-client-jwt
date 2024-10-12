"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const routes = {
    "/": loadLoginPage,
    "/main": loadMainPage,
    "/settings": loadSettingsPage,
  };

  const app = document.getElementById("app");
  const stylesheet = document.getElementById("stylesheet");

  function renderPage(pageFunction, styleSheet) {
    app.innerHTML = "";  
    pageFunction();
    stylesheet.setAttribute("href", `${styleSheet}`);
  }

  function loadLoginPage() {
    app.innerHTML = `
        <div class="container">
            <input type="checkbox" id="toggle-checkbox" />
            <div class="form-wrapper">
                <div class="form-container" id="login-form-container">
                    <form id="login-form">
                        <h2>Login</h2>
                        <input type="text" id="login-username" placeholder="Username" required />
                        <input type="password" id="login-password" placeholder="Password" required />
                        <button type="submit">Login</button>
                        <p>
                            Don't have an account?
                            <label for="toggle-checkbox" class="toggle-label">Register</label>
                        </p>
                    </form>
                </div>

                <div class="form-container" id="register-form-container">
                    <form id="register-form">
                        <h2>Register</h2>
                        <input type="text" id="register-username" placeholder="Username" required />
                        <input type="password" id="register-password" placeholder="Password" required />
                        <button type="submit">Register</button>
                        <p>
                            Already have an account?
                            <label for="toggle-checkbox" class="toggle-label">Login</label>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    `;

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Login logic
    // Login logic
    loginForm?.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();


      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          localStorage.setItem("token", data.token);
           window.history.pushState({}, "", "/main");
          renderPage(loadMainPage, "mainStyles.css");  
        } else {
          alert(data.error || "Login failed. Please check your credentials.");
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Please try again.");
      }
    });

    // Register logic
    registerForm?.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document
        .getElementById("register-username")
        .value.trim();
      const password = document
        .getElementById("register-password")
        .value.trim();

      try {
        const response = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
 
        if (response.ok && data.token) {
          localStorage.setItem("token", data.token);
          window.location.replace("main.html");
        } else {
          alert(data.error || "Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration. Please try again.");
      }
    });
  }

  function loadSettingsPage() {
    app.innerHTML = `

            <nav id="navbar">
                <h2>Todo App Settings</h2>
            </nav>
    
            <div id="sidebar">
                <button id="home-btn" class="sidebar-btn">Home</button>
            </div>
    
            <div id="main-content">
                <h1>Settings</h1>
                <form id="category-form">
                    <label for="todo-category">Select Category To Sort By:</label>
                    <select id="category-select">
                    </select>
                    <button type="submit">Save Category</button>
                </form>
    
                <p>Selected Category: <span id="selected-category">None</span></p>
    
                <div id="action-buttons">
                    <button id="delete-all-categories-btn" class="danger-btn">Delete All Categories</button>
                    <button id="delete-all-todos-btn" class="danger-btn">Delete All Todos</button>
                </div>
    
                <div id="custom-category-container">
                    <h2>Add a Custom Category</h2>
                    <input type="text" id="custom-category-input" placeholder="Enter custom category">
                    <button id="add-custom-category-btn">Add Category</button>
                </div>
            </div>
        `;

    setupSettingsEventListeners();
  }

  function setupSettingsEventListeners() {
    async function loadCategoriesSettings() {
      const categorySelect = document.getElementById("category-select");
      try {
        const response = await fetch(
          "http://localhost:3000/categories/custom-categories",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch custom categories");
        }

        const customCategories = await response.json();
        categorySelect.innerHTML = ""; 

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All Categories";
        categorySelect.appendChild(allOption);

        customCategories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.category_name;
          option.textContent = category.category_name;
          categorySelect.appendChild(option);
        });

        const defaultCategories = ["Work", "Personal", "Other"];
        defaultCategories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category;
          option.textContent = category;
          categorySelect.appendChild(option);
        });
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }
    const categorySelect = document.getElementById("category-select");
    const selectedCategoryDisplay =
      document.getElementById("selected-category");
    const customCategoryInput = document.getElementById(
      "custom-category-input"
    );
    const addCustomCategoryBtn = document.getElementById(
      "add-custom-category-btn"
    );
    const deleteAllCategoriesButton = document.getElementById(
      "delete-all-categories-btn"
    );
    const deleteAllTodosButton = document.getElementById(
      "delete-all-todos-btn"
    );
    const homeButton = document.getElementById("home-btn");

    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
      categorySelect.value = savedCategory;
      selectedCategoryDisplay.textContent = savedCategory;
    }

    loadCategoriesSettings();

    homeButton.addEventListener("click", () => {
      window.history.pushState({}, "", "/main");
      renderPage(loadMainPage, "mainStyles.css");
    });

    document.getElementById("category-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const selectedCategory = categorySelect.value;
      localStorage.setItem("selectedCategory", selectedCategory);
      selectedCategoryDisplay.textContent = selectedCategory;
      alert("Category saved successfully!");
    });

    addCustomCategoryBtn.addEventListener("click", async () => {
      const customCategory = customCategoryInput.value.trim();
      if (customCategory) {
        await saveCustomCategoryToDatabase(customCategory);
        customCategoryInput.value = ""; 
        const option = document.createElement("option");
        option.value = customCategory;
        option.textContent = customCategory;
        categorySelect.appendChild(option);
        alert(`Custom category "${customCategory}" added!`);
      } else {
        alert("Please enter a custom category.");
      }
    });

    if (deleteAllTodosButton) {
      deleteAllTodosButton.addEventListener("click", async () => {
        const confirmed = confirm(
          "Are you sure you want to delete all todos? This action cannot be undone."
        );
        if (confirmed) {
          try {
            const response = await fetch("http://localhost:3000/todo/all", {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              alert("All todos deleted successfully.");
            } else {
              const errorData = await response.json();
              alert(errorData.error || "Failed to delete todos.");
            }
          } catch (error) {
            console.error("Error deleting all todos:", error);
            alert("An error occurred while deleting todos.");
          }
        }
      });
    }

    if (deleteAllCategoriesButton) {
      deleteAllCategoriesButton.addEventListener("click", async () => {
        const confirmed = confirm(
          "Are you sure you want to delete all custom categories? This action cannot be undone."
        );
        if (confirmed) {
          try {
            const response = await fetch(
              "http://localhost:3000/categories/custom-categories",
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (response.ok) {
              alert("All custom categories deleted successfully.");
              loadCategoriesSettings();
            } else {
              const errorData = await response.json();
              alert(errorData.error || "Failed to delete custom categories.");
            }
          } catch (error) {
            console.error("Error deleting custom categories:", error);
            alert("An error occurred while deleting categories.");
          }
        }
      });
    }

    async function saveCustomCategoryToDatabase(category) {
      try {
        const response = await fetch(
          "http://localhost:3000/categories/custom-categories",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ category }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save custom category");
        }

        const data = await response.json();
      } catch (error) {
        console.error("Error saving custom category:", error);
      }
    }
  }

  function loadMainPage() {
    app.innerHTML = app.innerHTML = `
       <!-- Main Content -->
<nav id="navbar">
    <h2>Todo App</h2>
    <span id="username-display">Welcome ${displayUsername}</span>
</nav>

<!-- Flex container to wrap sidebar and main content -->
<div id="content-wrapper">
    <!-- Sidebar -->
    <div id="sidebar">
        <button class="sidebar-btn" id="settings-btn">Settings</button>
        <button id="logout-button" class="sidebar-btn">Logout</button> 
    </div>

    <!-- Main Content -->
    <div id="main-content"> 
        <h1>Todo List</h1>
        <form id="todo-form">
            <input type="text" id="todo-title" placeholder="Enter todo title" required>
            <textarea id="todo-description" placeholder="Enter todo description" required></textarea>
            <input type="datetime-local" id="todo-date-time" required>
            <select id="todo-category" required>
                <option value="">Select a category</option>
            </select>
            <button type="submit">Add Todo</button>
        </form>
        
        <input type="text" id="search-input" placeholder="Search todos..." />
        <ul id="todo-list"></ul>
    </div>
</div>

<!-- Edit Todo Dialog -->
<dialog    id="editDialog">
    <form id="editForm">
        <label for="editTitle">Title:</label>
        <input type="text" id="editTitle" >
        
        <label for="editCategory">Category:</label>
        <select id="editCategory" >
            <!-- Options will be populated dynamically -->
        </select>
        
        <label for="editDescription">Description:</label>
        <textarea id="editDescription" ></textarea>
        
        <label for="editDate">Date/Time:</label>
        <input type="datetime-local" id="editDate" >
        
        <button type="submit">Save</button>
        <button type="button" id="cancelBtn">Cancel</button>
    </form>
</dialog>

    `;
    displayUsername();
    loadMainCategories();
    setupEventListeners();
    fetchTodos();
    const selectedCategory = localStorage.getItem("selectedCategory") || "all";
    fetchTodos(selectedCategory);
  }

  function setupEventListeners() {
    const settingsButton = document.getElementById("settings-btn");
    settingsButton?.addEventListener("click", () => {
      window.history.pushState({}, "", "/settings");
      renderPage(loadSettingsPage, "settingsStyles.css");
    });

    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      filterTodos(searchTerm);
    });

    document
      .getElementById("todo-form")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const title = document.getElementById("todo-title").value.trim();
        const category = document.getElementById("todo-category").value;
        const description = document
          .getElementById("todo-description")
          .value.trim();
        const date_time = document.getElementById("todo-date-time").value;

        if (!title || !description || !date_time || !category) {
          alert("Please fill all fields!");
          return;
        }

        await addTodo({ title, description, date_time, category });
      });

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", logout);
  }

  async function displayUsername() {
    const token = localStorage.getItem("token");
    const payload = decodeToken(token);
    if (payload) {
      document.getElementById(
        "username-display"
      ).textContent = `Welcome, ${payload.username}`;
    }
  }

  function decodeToken(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      console.error("Failed to decode token:", e);
      return null;
    }
  }
  async function loadCategoriesEdit() {
    const categorySelect = document.getElementById("editCategory");
    try {
      const response = await fetch(
        "http://localhost:3000/categories/custom-categories",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch custom categories");
      }

      const customCategories = await response.json();
      categorySelect.innerHTML = ""; // Clear existing options

      customCategories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.category_name;
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });

      const defaultCategories = ["Work", "Personal", "Other"];
      defaultCategories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadMainCategories() {
    const categorySelect = document.getElementById("todo-category");
    try {
      const response = await fetch(
        "http://localhost:3000/categories/custom-categories",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch custom categories");
      }

      const customCategories = await response.json();
      categorySelect.innerHTML = ""; // Clear existing options

      customCategories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.category_name;
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });

      const defaultCategories = ["Work", "Personal", "Other"];
      defaultCategories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function addTodo({ title, description, date_time, category }) {
    let token = localStorage.getItem("token");

    let response = await fetch("http://localhost:3000/todo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, date_time, category }),
    });

    if (!response.ok) {
      alert("Failed to add todo!");
      return;
    }

    await fetchTodos();
  }
  async function fetchTodos(category = null) {
    const token = localStorage.getItem("token");

    try {
      const selectedCategory =
        category || localStorage.getItem("selectedCategory") || "all";
      const url =
        selectedCategory !== "all"
          ? `http://localhost:3000/todo?category=${selectedCategory}`
          : `http://localhost:3000/todo`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok)
        throw new Error("Failed to fetch todos: " + response.statusText);

      const todos = await response.json();
      renderTodoList(todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      alert("There was an error fetching your todos. Please try again later.");
    }
  }
  function renderTodoList(todos) {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = ""; 

    todos.forEach((todo) => {
      const todoItem = document.createElement("div");
      todoItem.className = "todo-item";
      todoItem.innerHTML = `
                <h3>${todo.title}</h3>
                <p>${todo.description}</p>
                <p>${new Date(todo.date_time).toLocaleString()}</p>
                <p><strong>Category:</strong> ${
                  todo.category
                }</p> <!-- Display category -->
                <button class="delete-todo-btn" data-id="${
                  todo.id
                }">Delete</button>
                <button class="edit-btn" data-id="${todo.id}">Edit</button>
                
            `;
      todoList.appendChild(todoItem);
    });
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const todoId = button.dataset.id;
        const todo = todos.find((t) => t.id == todoId); 
        editTodoItem(
          todo.id,
          todo.title,
          todo.category,
          todo.description,
          todo.date_time
        );
      });
    });

    document.querySelectorAll(".delete-todo-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const todoId = button.dataset.id;
        await deleteTodo(todoId);
        fetchTodos();
      });
    });
  }
  async function editTodoItem(
    id,
    currentTitle,
    currentCategory,
    currentDescription,
    currentDateTime
  ) {
    const editDialog = document.getElementById("editDialog");

    document.getElementById("editTitle").value = currentTitle;
    document.getElementById("editDescription").value = currentDescription;
    document.getElementById("editDate").value = currentDateTime;

    await loadCategoriesEdit();
    document.getElementById("editCategory").value = currentCategory;

    editDialog.showModal();

    document.getElementById("editForm").onsubmit = async function (event) {
      event.preventDefault(); 

      const newTitle = document.getElementById("editTitle").value.trim();
      const newCategory = document.getElementById("editCategory").value; 
      const newDescription = document
        .getElementById("editDescription")
        .value.trim();
      const newDateTime = document.getElementById("editDate").value.trim();

      const updates = {};

      if (newTitle) updates.title = newTitle;
      if (newCategory) updates.category = newCategory;
      if (newDescription) updates.description = newDescription;
      if (newDateTime) updates.date_time = newDateTime;

      if (Object.keys(updates).length === 0) {
        alert("At least one field must be filled!");
        return;
      }

      const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (newDateTime && !dateTimeRegex.test(newDateTime)) {
        alert("Date/time must be in the format YYYY-MM-DDTHH:MM.");
        return;
      }

      await updateTodoDetails(id, updates);
      fetchTodos(); 
      editDialog.close();
    };

    document.getElementById("cancelBtn").onclick = function () {
      editDialog.close();
    };
  }

  async function updateTodoDetails(id, updatedFields) {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3000/todo/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(updatedFields), 
    });
  }

  async function deleteTodo(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/todo/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to delete todo!");
    }
  }

  function filterTodos(searchTerm) {
    const todos = document.querySelectorAll(".todo-item");
    todos.forEach((todo) => {
      const title = todo.querySelector("h3").textContent.toLowerCase();
      todo.style.display = title.includes(searchTerm) ? "block" : "none";
    });
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }

  const path = window.location.pathname;
  if (routes[path]) {
    renderPage(
      routes[path],
      path === "/" ? "loginStyles.css" : "mainStyles.css"
    );
  } else {
    renderPage(loadLoginPage, "loginStyles.css");
  }
  window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    if (routes[path]) {
      renderPage(
        routes[path],
        path === "/main" ? "mainStyles.css" : "settingsStyles.css"
      );
    }
  });
});
