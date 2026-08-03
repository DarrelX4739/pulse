import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================
// CONFIG
// =====================================

const ALLOWED_UID = "WzbTdt1HZKQPPiROrt413PtHudH3";

// =====================================
// ELEMENTS
// =====================================

// Login Page

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

// Dashboard

const logoutBtn = document.getElementById("logoutBtn");
const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");
const greetingElement = document.getElementById("greeting");

// =====================================
// LOGIN
// =====================================

if (loginBtn) {

    async function login() {

        message.textContent = "";

        if (
            email.value.trim() === "" ||
            password.value === ""
        ) {

            message.textContent =
                "Please enter your email and password.";

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

            if (
                userCredential.user.uid !==
                ALLOWED_UID
            ) {

                await signOut(auth);

                message.textContent =
                    "Access denied.";

                loginBtn.disabled = false;

                loginBtn.textContent =
                    "Sign In";

                return;

            }

            window.location.href =
                "dashboard.html";

        }

        catch {

            message.textContent =
                "Incorrect email or password.";

        }

        loginBtn.disabled = false;

        loginBtn.textContent =
            "Sign In";

    }

    loginBtn.addEventListener(
        "click",
        login
    );

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                login();

            }

        }
    );

}

// =====================================
// LOGOUT
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            window.location.href =
                "index.html";

        }
    );

}

// =====================================
// AUTH CHECK
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        const isDashboard =
            window.location.pathname.includes(
                "dashboard.html"
            );

        const isLogin =
            window.location.pathname.includes(
                "index.html"
            ) ||
            window.location.pathname.endsWith("/");

        if (!user) {

            if (isDashboard) {

                window.location.href =
                    "index.html";

            }

            return;

        }

        if (
            user.uid !== ALLOWED_UID
        ) {

            await signOut(auth);

            return;

        }

        if (isLogin) {

            window.location.href =
                "dashboard.html";

        }

    }
);

// =====================================
// DASHBOARD
// =====================================

// =====================================
// CLOCK, DATE & GREETING
// =====================================

function updateDashboard() {

    if (!timeElement || !dateElement) return;

    const now = new Date();

    // Time
    timeElement.textContent = now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });

    // Date
    dateElement.textContent = now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Greeting
    if (greetingElement) {

        const hour = now.getHours();

        let greeting = "Hello";

        if (hour < 12) {

            greeting = "Good Morning";

        }

        else if (hour < 18) {

            greeting = "Good Afternoon";

        }

        else {

            greeting = "Good Evening";

        }

        greetingElement.textContent =
            `${greeting}, Darrel 👋`;

    }

}

if (timeElement && dateElement) {

    updateDashboard();

    setInterval(updateDashboard, 1000);

}
