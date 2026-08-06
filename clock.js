/* ==========================================
   PULSE CLOCK
========================================== */

// ---------- Elements ----------

const clockFace = document.querySelector(".clock-face");

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");

const digitalClock = document.getElementById("digitalClock");
const clockDate = document.getElementById("clockDate");


// ---------- Generate Tick Marks ----------

for (let i = 0; i < 60; i++) {

    const tick = document.createElement("div");

    tick.classList.add("clock-tick");

    if (i % 5 === 0) {

        tick.classList.add("hour-tick");

    }

    tick.style.transform =
        `translate(-50%, -50%) rotate(${i * 6}deg)`;

    clockFace.appendChild(tick);

}


// ---------- Generate Numbers ----------

const radius = 170;

for (let i = 1; i <= 12; i++) {

    const number = document.createElement("div");

    number.className = "clock-number";

    number.textContent = i;

    const angle = (i * 30 - 90) * Math.PI / 180;

    const x = 210 + radius * Math.cos(angle);

    const y = 210 + radius * Math.sin(angle);

    number.style.left = `${x}px`;
    number.style.top = `${y}px`;

    clockFace.appendChild(number);

}


// ---------- Update Clock ----------

function updateClock() {

    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const secondAngle =
        (seconds + milliseconds / 1000) * 6;

    const minuteAngle =
        (minutes + seconds / 60) * 6;

    const hourAngle =
        ((hours % 12) + minutes / 60) * 30;

    hourHand.style.transform =
        `translate(-50%, -100%) rotate(${hourAngle}deg)`;

    minuteHand.style.transform =
        `translate(-50%, -100%) rotate(${minuteAngle}deg)`;

    secondHand.style.transform =
        `translate(-50%, -100%) rotate(${secondAngle}deg)`;

    digitalClock.textContent =
        now.toLocaleTimeString("en-AU", {

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false

        });

    clockDate.textContent =
        now.toLocaleDateString("en-AU", {

            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"

        });

    requestAnimationFrame(updateClock);

}

requestAnimationFrame(updateClock);

/* ==========================================
   SIDEBAR
========================================== */

async function loadSidebar() {

    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    const response = await fetch("sidebar.html");

    sidebar.innerHTML = await response.text();

    // Highlight Clock page
    document.querySelectorAll(".nav-link").forEach(link => {

        if (link.getAttribute("href") === "clock.html") {

            link.classList.add("active");

        }

    });

}

loadSidebar();


/* ==========================================
   LOGOUT
========================================== */

import { auth } from "./firebase.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.getElementById("logoutBtn")?.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "index.html";

});


/* ==========================================
   KEEP HANDS ABOVE TICKS
========================================== */

clockFace.appendChild(hourHand);
clockFace.appendChild(minuteHand);
clockFace.appendChild(secondHand);

clockFace.appendChild(document.querySelector(".centre-dot"));
