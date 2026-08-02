// =============================
// Pulse Login
// =============================

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ------------------------------------
// HTML Elements
// ------------------------------------

const email = document.getElementById("email");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

// ------------------------------------
// CHANGE THIS
// ------------------------------------

const ALLOWED_UID = "WzbTdt1HZKQPPiROrt413PtHudH3";

// ------------------------------------
// Login
// ------------------------------------

async function login() {

    message.textContent = "";

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    if (emailValue === "" || passwordValue === "") {

        message.textContent = "Please enter your email and password.";

        return;

    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Signing In...";

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                emailValue,
                passwordValue
            );

        const user = userCredential.user;

        // Extra security
        if (user.uid !== ALLOWED_UID) {

            await signOut(auth);

            message.textContent =
                "Access denied.";

            loginBtn.disabled = false;
            loginBtn.textContent = "Sign In";

            return;

        }

        window.location.href = "dashboard.html";

    }

    catch(error){

        console.error(error);

        switch(error.code){

            case "auth/invalid-email":
                message.textContent =
                    "Invalid email address.";
                break;

            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                message.textContent =
                    "Incorrect email or password.";
                break;

            case "auth/too-many-requests":
                message.textContent =
                    "Too many attempts. Please try again later.";
                break;

            default:
                message.textContent =
                    "Unable to sign in.";

        }

    }

    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";

}

// ------------------------------------
// Login Button
// ------------------------------------

loginBtn.addEventListener("click", login);

// ------------------------------------
// Press Enter
// ------------------------------------

document.addEventListener("keydown", (event)=>{

    if(event.key==="Enter"){

        login();

    }

});

// ------------------------------------
// Already Logged In?
// ------------------------------------

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        return;

    }

    if(user.uid !== ALLOWED_UID){

        await signOut(auth);

        return;

    }

    window.location.href = "dashboard.html";

});
