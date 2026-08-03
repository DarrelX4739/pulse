import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const ALLOWED_UID = "WzbTdt1HZKQPPiROrt413PtHudH3";

// --------------------
// Login Page
// --------------------

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

if (loginBtn) {

    async function login() {

        message.textContent = "";

        if (email.value.trim() === "" || password.value === "") {
            message.textContent = "Please enter your email and password.";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing In...";

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email.value.trim(),
                    password.value
                );

            if (userCredential.user.uid !== ALLOWED_UID) {

                await signOut(auth);

                message.textContent = "Access denied.";

                loginBtn.disabled = false;
                loginBtn.textContent = "Sign In";

                return;

            }

            window.location.href = "dashboard.html";

        }

        catch {

            message.textContent =
                "Incorrect email or password.";

        }

        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";

    }

    loginBtn.addEventListener("click", login);

    document.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            login();

        }

    });

}

// --------------------
// Dashboard
// --------------------

const logoutBtn = document.getElementById("logoutBtn");

const timeElement = document.getElementById("time");

const dateElement = document.getElementById("date");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "index.html";

    });

}

// --------------------
// Authentication Check
// --------------------

onAuthStateChanged(auth, async (user) => {

    const isDashboard =
        window.location.pathname.includes("dashboard.html");

    const isLogin =
        window.location.pathname.includes("index.html") ||
        window.location.pathname.endsWith("/");

    if (!user) {

        if (isDashboard) {

            window.location.href = "index.html";

        }

        return;

    }

    if (user.uid !== ALLOWED_UID) {

        await signOut(auth);

        return;

    }

    if (isLogin) {

        window.location.href = "dashboard.html";

    }

});

// --------------------
// Sydney Clock
// --------------------

function updateSydneyTime() {

    if (!timeElement || !dateElement) return;

    const now = new Date();

    timeElement.textContent = now.toLocaleTimeString(
        "en-AU",
        {
            timeZone: "Australia/Sydney",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit"
        }
    );

    dateElement.textContent = now.toLocaleDateString(
        "en-AU",
        {
            timeZone: "Australia/Sydney",
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}

updateSydneyTime();

setInterval(updateSydneyTime, 1000);
