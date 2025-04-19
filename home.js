const SIGNLOG = document.getElementById('signuplogin');
let USERBASICS = document.getElementById('userbasics');

if (USERBASICS===null) {
    USERBASICS='';
}

if (window.location.href.includes('pricing.html')) {
    if (sessionStorage.getItem("user") === "HourArrival") {
        document.getElementById('plan').innerHTML=`<p style="color: grey;"><svg viewBox="0 0 192 512" width="35" height="20" title="exclamation"><path d="M176 432c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80zM25.26 25.199l13.6 272C39.499 309.972 50.041 320 62.83 320h66.34c12.789 0 23.331-10.028 23.97-22.801l13.6-272C167.425 11.49 156.496 0 142.77 0H49.23C35.504 0 24.575 11.49 25.26 25.199z" /></svg>Removed for admins.</p>`;
    }
}

if (!localStorage.getItem("users") || !localStorage.getItem("passwords")) {
    localStorage.setItem("users", JSON.stringify([]));
    localStorage.setItem("passwords", JSON.stringify([]));
}

async function showAllUsers() {
    try {
        const loggedInUser = sessionStorage.getItem("user");

        if (loggedInUser !== "HourArrival") {
            alert("Only the admin can view all users and their plans.");
            return;
        }

        const response = await fetch('https://192.168.0.28:3000/users-plans'); // Changed http:// to https://
        const users = await response.json();

        if (response.ok) {
            const userList = users.map(user => `<li>${user.username}: ${user.plan_type}</li>`).join('');
            SIGNLOG.innerHTML = `
                <div style="border: 1px solid black; background-color: #fefefe; margin: 3% 25%; padding: 8px; align-items: center; text-align: center; border-radius: 5px;">
                    <h1>All Users|Their Plans</h1>
                    <hr>
                    <ul>${userList}</ul>
                </div>`;
        } else {
            alert("Failed to fetch users and their plans.");
        }
    } catch (error) {
        console.error("Error fetching users and plans:", error);
        alert("An error occurred. Please try again.");
    }
}

function checkSession() {
    const loggedInUser = sessionStorage.getItem("user");
    if (loggedInUser) {
        if (loggedInUser === "HourArrival") {
            USERBASICS.innerHTML = `
                Welcome, ${loggedInUser}.
                <button onclick="logout()">Log Out</button>
                <button onclick="showAllUsers()"><svg viewBox="0 0 576 512" width="35" height="20" title="address-card"><path d="M528 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-352 96c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm112 236.8c0 10.6-10 19.2-22.4 19.2H86.4C74 384 64 375.4 64 364.8v-19.2c0-31.8 30.1-57.6 67.2-57.6h5c12.3 5.1 25.7 8 39.8 8s27.6-2.9 39.8-8h5c37.1 0 67.2 25.8 67.2 57.6v19.2zM512 312c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16z" /></svg></button>
                <button onclick="manageUsers()"><svg viewBox="0 0 640 512" width="35" height="20" title="user-cog"><path d="M610.5 373.3c2.6-14.1 2.6-28.5 0-42.6l25.8-14.9c3-1.7 4.3-5.2 3.3-8.5-6.7-21.6-18.2-41.2-33.2-57.4-2.3-2.5-6-3.1-9-1.4l-25.8 14.9c-10.9-9.3-23.4-16.5-36.9-21.3v-29.8c0-3.4-2.4-6.4-5.7-7.1-22.3-5-45-4.8-66.2 0-3.3.7-5.7 3.7-5.7 7.1v29.8c-13.5 4.8-26 12-36.9 21.3l-25.8-14.9c-2.9-1.7-6.7-1.1-9 1.4-15 16.2-26.5 35.8-33.2 57.4-1 3.3.4 6.8 3.3 8.5l25.8 14.9c-2.6 14.1-2.6 28.5 0 42.6l-25.8 14.9c-3 1.7-4.3 5.2-3.3 8.5 6.7 21.6 18.2 41.1 33.2 57.4 2.3 2.5 6 3.1 9 1.4l25.8-14.9c10.9 9.3 23.4 16.5 36.9 21.3v29.8c0 3.4 2.4 6.4 5.7 7.1 22.3 5 45 4.8 66.2 0 3.3-.7 5.7-3.7 5.7-7.1v-29.8c13.5-4.8 26-12 36.9-21.3l25.8 14.9c2.9 1.7 6.7 1.1 9-1.4 15-16.2 26.5-35.8 33.2-57.4 1-3.3-.4-6.8-3.3-8.5l-25.8-14.9zM496 400.5c-26.8 0-48.5-21.8-48.5-48.5s21.8-48.5 48.5-48.5 48.5 21.8 48.5 48.5-21.7 48.5-48.5 48.5zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm201.2 226.5c-2.3-1.2-4.6-2.6-6.8-3.9l-7.9 4.6c-6 3.4-12.8 5.3-19.6 5.3-10.9 0-21.4-4.6-28.9-12.6-18.3-19.8-32.3-43.9-40.2-69.6-5.5-17.7 1.9-36.4 17.9-45.7l7.9-4.6c-.1-2.6-.1-5.2 0-7.8l-7.9-4.6c-16-9.2-23.4-28-17.9-45.7.9-2.9 2.2-5.8 3.2-8.7-3.8-.3-7.5-1.2-11.4-1.2h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c10.1 0 19.5-3.2 27.2-8.5-1.2-3.8-2-7.7-2-11.8v-9.2z" /></svg></button>`;
        } else {
            USERBASICS.innerHTML = `
                Welcome, ${loggedInUser}.
                <button onclick="logout()">Log Out</button>
                <button onclick="deleteAccount()">Delete Account</button>`;
        }
    } else {
        USERBASICS.innerHTML = `
            Welcome, Guest.
            Please <button onclick="checkUser()">Log In</button> or
            <button onclick="makeUser()">Sign Up</button>.`;
    }
}

function checkUser() {
    SIGNLOG.innerHTML = `
        <div style="border: 1px solid black; background-color: #fefefe; margin: 3% 25%; padding: 8px; align-items: center; text-align: center; border-radius: 5px;">
            <h1>Log In</h1>
            <input type="text" id="username" placeholder="Username" required><br><br>
            <input type="password" id="password" placeholder="Password" required><br><br>
            <button id="submit" onclick="reviewUser()">Check</button>
        </div>`;
}

async function reviewUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch('https://192.168.0.28:3000/login', { // Changed http:// to https://
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            sessionStorage.setItem("user", result.username);
            alert("You are now logged in!");
            USERBASICS.innerHTML = `Welcome, ${result.username}. <button onclick="logout()">Log Out</button>`;
            SIGNLOG.innerHTML = "";
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred. Please try again.");
    }
}

function makeUser() {
    SIGNLOG.innerHTML = `
        <div style="border: 1px solid black; background-color: #fefefe; margin: 3% 25%; padding: 8px; align-items: center; text-align: center; border-radius: 5px;">
            <h1>Sign Up</h1>
            <input type="text" id="username" placeholder="Username" required><br><br>
            <input type="password" id="password" placeholder="Password" required><br><br>
            <button id="submit" onclick="newUser()">Create Account</button>
        </div>`;
}

async function newUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch('https://192.168.0.28:3000/signup', { // Changed http:// to https://
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            sessionStorage.setItem("user", username);
            alert("Account created successfully! You are now logged in.");
            USERBASICS.innerHTML = `Welcome, ${username}. <button onclick="logout()">Log Out</button>`;
            window.location.reload();
            SIGNLOG.innerHTML = "";
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error signing up:", error);
        alert("An error occurred. Please try again.");
    }
}

function logout() {
    sessionStorage.removeItem("user");
    alert("You have been logged out.");
    USERBASICS.innerHTML = `Welcome, Guest. Please <button onclick="checkUser()">Log In</button> or <button onclick="makeUser()">Sign Up</button>.`;
    window.location.reload();
}

async function deleteAccount() {
    const loggedInUser = sessionStorage.getItem("user");

    if (!loggedInUser) {
        alert("You must be logged in to delete your account.");
        return;
    }
    if (loggedInUser === "HourArrival") {
        alert("The admin account cannot be deleted.");
        window.location.reload();
    }

    const confirmation = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmation) return;

    try {
        const response = await fetch(`https://192.168.0.28:3000/delete-account`, { // Changed http:// to https://
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loggedInUser })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Your account has been deleted.");
            sessionStorage.removeItem("user");
            USERBASICS.innerHTML = `Welcome, Guest. Please <button onclick="checkUser()">Log In</button> or <button onclick="makeUser()">Sign Up</button>.`;
            window.location.reload();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error deleting account:", error);
        alert("An error occurred. Please try again.");
    }
}

function checkSession() {
    const loggedInUser = sessionStorage.getItem("user");
    if (loggedInUser) {
        if (loggedInUser === "HourArrival") {
            USERBASICS.innerHTML = `
                Welcome, ${loggedInUser}.
                <button onclick="logout()">Log Out</button>
                <button onclick="showAllUsers()"><svg viewBox="0 0 576 512" width="35" height="20" title="address-card"><path d="M528 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-352 96c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm112 236.8c0 10.6-10 19.2-22.4 19.2H86.4C74 384 64 375.4 64 364.8v-19.2c0-31.8 30.1-57.6 67.2-57.6h5c12.3 5.1 25.7 8 39.8 8s27.6-2.9 39.8-8h5c37.1 0 67.2 25.8 67.2 57.6v19.2zM512 312c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16z" /></svg></button>
                <button onclick="manageUsers()"><svg viewBox="0 0 640 512" width="35" height="20" title="user-cog"><path d="M610.5 373.3c2.6-14.1 2.6-28.5 0-42.6l25.8-14.9c3-1.7 4.3-5.2 3.3-8.5-6.7-21.6-18.2-41.2-33.2-57.4-2.3-2.5-6-3.1-9-1.4l-25.8 14.9c-10.9-9.3-23.4-16.5-36.9-21.3v-29.8c0-3.4-2.4-6.4-5.7-7.1-22.3-5-45-4.8-66.2 0-3.3.7-5.7 3.7-5.7 7.1v29.8c-13.5 4.8-26 12-36.9 21.3l-25.8-14.9c-2.9-1.7-6.7-1.1-9 1.4-15 16.2-26.5 35.8-33.2 57.4-1 3.3.4 6.8 3.3 8.5l25.8 14.9c-2.6 14.1-2.6 28.5 0 42.6l-25.8 14.9c-3 1.7-4.3 5.2-3.3 8.5 6.7 21.6 18.2 41.1 33.2 57.4 2.3 2.5 6 3.1 9 1.4l25.8-14.9c10.9 9.3 23.4 16.5 36.9 21.3v29.8c0 3.4 2.4 6.4 5.7 7.1 22.3 5 45 4.8 66.2 0 3.3-.7 5.7-3.7 5.7-7.1v-29.8c13.5-4.8 26-12 36.9-21.3l25.8 14.9c2.9 1.7 6.7 1.1 9-1.4 15-16.2 26.5-35.8 33.2-57.4 1-3.3-.4-6.8-3.3-8.5l-25.8-14.9zM496 400.5c-26.8 0-48.5-21.8-48.5-48.5s21.8-48.5 48.5-48.5 48.5 21.8 48.5 48.5-21.7 48.5-48.5 48.5zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm201.2 226.5c-2.3-1.2-4.6-2.6-6.8-3.9l-7.9 4.6c-6 3.4-12.8 5.3-19.6 5.3-10.9 0-21.4-4.6-28.9-12.6-18.3-19.8-32.3-43.9-40.2-69.6-5.5-17.7 1.9-36.4 17.9-45.7l7.9-4.6c-.1-2.6-.1-5.2 0-7.8l-7.9-4.6c-16-9.2-23.4-28-17.9-45.7.9-2.9 2.2-5.8 3.2-8.7-3.8-.3-7.5-1.2-11.4-1.2h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c10.1 0 19.5-3.2 27.2-8.5-1.2-3.8-2-7.7-2-11.8v-9.2z" /></svg></button>`;
        } else {
            USERBASICS.innerHTML = `
                Welcome, ${loggedInUser}.
                <button onclick="logout()">Log Out</button>
                <button onclick="deleteAccount()">Delete Account</button>`;
        }
    } else {
        USERBASICS.innerHTML = `
            Welcome, Guest.
            Please <button onclick="checkUser()">Log In</button> or
            <button onclick="makeUser()">Sign Up</button>.`;
    }
}

async function saveUserPlan(username, planType) {
    try {
        const response = await fetch('https://192.168.0.28:3000/update-plan', { // Changed http:// to https://
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, planType })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update plan');
        }
        console.log('Sending data:', { username, planType });
        const data = await response.json();
        console.log(data.message);
        alert('Plan updated successfully!');
    } catch (error) {
        console.error('Error updating plan:', error);
        alert('Failed to update plan. Please try again.');
    };
};

async function manageUsers() {
    try {
        const response = await fetch('https://192.168.0.28:3000/users', { // Changed http:// to https://
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users.');
        }

        const users = await response.json();

        const userList = users
            .filter(user => user.username !== 'HourArrival')
            .map(user => `
                <li>
                    ${user.username}:
                    <button onclick="deleteUser('${user.username}')" style="background-color: darkred;"><svg viewBox="0 0 448 512" width="20" height="20" title="trash-alt"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z" /></svg></button>
                    <hr>
                </li>
            `)
            .join('');

        SIGNLOG.innerHTML = `
            <div style="border: 1px solid black; background-color: #fefefe; margin: 3% 25%; padding: 8px; align-items: center; text-align: center; border-radius: 5px;">
                <h1>Manage Users</h1>
                <ul>${userList}</ul>
            </div>`;
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('An error occurred while fetching users.');
    }
}

async function deleteUser(username) {
    const confirmation = confirm(`Are you sure you want to delete the account for ${username}?`);
    if (!confirmation) return;

    try {
        const response = await fetch('https://192.168.0.28:3000/delete-user', { // Changed http:// to https://
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete user.');
        }

        alert(`User ${username} has been deleted.`);
        manageUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user.');
    }
}

checkSession();