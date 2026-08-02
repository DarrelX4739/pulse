// Firebase configuration and initialization

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCUItHvW2Q1cTPMe1cLfHI-sLS4gosz0PA",
    authDomain: "darrelx4739-pulse.firebaseapp.com",
    projectId: "darrelx4739-pulse",
    storageBucket: "darrelx4739-pulse.firebasestorage.app",
    messagingSenderId: "866719127872",
    appId: "1:866719127872:web:709c50e2e3cb955ff982a5",
    measurementId: "G-SS8FJ3TCLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export services
export { auth, db, analytics };
