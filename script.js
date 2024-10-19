// Password strength checker function
function setupPasswordStrengthChecker(inputId, strengthBarId) {
    const passwordInput = document.getElementById(inputId);
    const strengthBar = document.querySelector(`#${strengthBarId} .progress-bar`);

    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            strengthBar.style.width = `${strength}%`;
            strengthBar.className = 'progress-bar';
            strengthBar.classList.add(getStrengthClass(strength));
        });
    }
}

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length > 6) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[$@#&!]/.test(password)) strength += 20;
    return strength;
}

function getStrengthClass(strength) {
    if (strength < 40) return 'bg-danger';
    if (strength < 80) return 'bg-warning';
    return 'bg-success';
}

// Initialize password strength checkers for both forms
setupPasswordStrengthChecker('login-password', 'password-strength-login');
setupPasswordStrengthChecker('reg-password', 'password-strength-register');

// CAPTCHA generation
const captchaCanvas = document.getElementById('captcha-canvas');
const refreshCaptchaButton = document.getElementById('refresh-captcha');

function generateCaptcha() {
    const ctx = captchaCanvas.getContext('2d');
    ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
    ctx.font = '30px Arial';
    const captchaText = Math.random().toString(36).substring(2, 8);
    ctx.fillText(captchaText, 10, 50);
    captchaCanvas.setAttribute('data-captcha-text', captchaText);
}

if (captchaCanvas && refreshCaptchaButton) {
    generateCaptcha();
    refreshCaptchaButton.addEventListener('click', generateCaptcha);
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            alert(`Please fill in the ${input.name} field.`);
        }
    });
    return isValid;
}

function validateCaptcha() {
    const captchaInput = document.getElementById('captcha-input');
    const captchaText = captchaCanvas.getAttribute('data-captcha-text');
    if (captchaInput && captchaCanvas) {
        if (captchaInput.value.trim() !== captchaText) {
            alert('CAPTCHA is incorrect. Please try again.');
            generateCaptcha();
            return false;
        }
    }
    return true;
}

// To-Do List functionality
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date');
const todoList = document.getElementById('todo-list');
const filterAll = document.getElementById('filter-all');
const filterActive = document.getElementById('filter-active');
const filterCompleted = document.getElementById('filter-completed');
const clearCompleted = document.getElementById('clear-completed');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

if (todoForm) {
    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask();
    });

    filterAll.addEventListener('click', () => filterTasks('all'));
    filterActive.addEventListener('click', () => filterTasks('active'));
    filterCompleted.addEventListener('click', () => filterTasks('completed'));
    clearCompleted.addEventListener('click', clearCompletedTasks);
}

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    if (!isValidDate(dueDate)) {
        alert('Please enter a valid due date!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        dueDate: dueDate,
        completed: false
    };

    todos.push(task);
    saveTodos();
    renderTasks();
    taskInput.value = '';
    dueDateInput.value = '';
}

function renderTasks() {
    todoList.innerHTML = '';
    todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    todos.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span class="${task.completed ? 'text-decoration-line-through' : ''}">${task.text} (Due: ${task.dueDate})</span>
            <div>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="toggleTask(${task.id})">Toggle</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });

    updateBackground();
}

function toggleTask(id) {
    const task = todos.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTodos();
        renderTasks();
    }
}

function deleteTask(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTasks();
}

function filterTasks(filter) {
    const filteredTasks = todos.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
    });

    renderFilteredTasks(filteredTasks);
}

function renderFilteredTasks(filteredTasks) {
    todoList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span class="${task.completed ? 'text-decoration-line-through' : ''}">${task.text} (Due: ${task.dueDate})</span>
            <div>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="toggleTask(${task.id})">Toggle</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

function clearCompletedTasks() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTasks();
}

function updateBackground() {
    const allCompleted = todos.length > 0 && todos.every(t => t.completed);
    document.body.style.backgroundImage = allCompleted
        ? "url('https://images.pexels.com/photos/3377405/pexels-photo-3377405.jpeg')"
        : "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg')";
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Form validation
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form'); // Added this line
const ownerLoginForm = document.getElementById('owner-login-form');
const contactForm = document.getElementById('contact-form');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            // Existing login logic
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (storedUser && storedUser.email === email && storedUser.password === password) {
                localStorage.setItem('loggedIn', 'user');
                displayProfile('user');
            } else {
                alert('Invalid email or password!');
            }
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const gender = document.getElementById('reg-gender').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            const user = {
                name: name,
                email: email,
                phone: phone,
                gender: gender,
                password: password
            };

            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(user));

            alert('Registration successful! Please log in.');
            // Switch to login tab
            const loginTab = new bootstrap.Tab(document.querySelector('#user-login-tab'));
            loginTab.show();
        }
    });
}

if (ownerLoginForm) {
    ownerLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            const ownerUsername = document.getElementById('owner-username').value.trim();
            const ownerPassword = document.getElementById('owner-password').value;

            // Fixed credentials
            const fixedUsername = 'BL.EN.U4AIE21028@bl.students.amrita.edu';
            const fixedPassword = '17Deepak@2004';

            if (ownerUsername === fixedUsername && ownerPassword === fixedPassword) {
                localStorage.setItem('loggedIn', 'owner');
                displayProfile('owner');
            } else {
                alert('Invalid owner username or password!');
            }
        }
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm(this) && validateCaptcha()) {
            alert('Message sent successfully!');
            // Clear form
            contactForm.reset();
            generateCaptcha();
        }
    });
}

// Display Profile Function
function displayProfile(userType) {
    // Hide forms
    document.getElementById('loginTabs').style.display = 'none';
    document.getElementById('loginTabsContent').style.display = 'none';
    // Show profile
    const userProfileSection = document.getElementById('user-profile');
    userProfileSection.style.display = 'block';
    document.getElementById('logout-button').style.display = 'block';

    if (userType === 'user') {
        // Fetch user data
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            document.getElementById('profile-name').textContent = storedUser.name;
            document.getElementById('profile-email').textContent = storedUser.email;
            document.getElementById('profile-phone').textContent = storedUser.phone;
            document.getElementById('profile-location').textContent = 'Bengaluru, India';
        }
    } else if (userType === 'owner') {
        // Set owner data
        document.getElementById('profile-name').textContent = 'Deepak Kumar Bommala';
        document.getElementById('profile-email').textContent = 'deepakbommala@gmail.com';
        document.getElementById('profile-phone').textContent = '9392439382';
        document.getElementById('profile-location').textContent = 'Bengaluru, India';
    }
}

// Check login state on page load
document.addEventListener('DOMContentLoaded', function() {
    const loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn === 'user' || loggedIn === 'owner') {
        displayProfile(loggedIn);
    }
    if (todoList) {
        renderTasks();
    }
    if (captchaCanvas) {
        generateCaptcha();
    }
});

// Logout Functionality
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', function() {
        // Clear login state
        localStorage.removeItem('loggedIn');
        // Hide profile and show login section
        document.getElementById('user-profile').style.display = 'none';
        document.getElementById('loginTabs').style.display = 'block';
        document.getElementById('loginTabsContent').style.display = 'block';
        logoutButton.style.display = 'none';
    });
}
