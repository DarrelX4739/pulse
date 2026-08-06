import { auth, db } from "./firebase.js";

import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ==========================================
   LOAD SIDEBAR
========================================== */

async function loadSidebar() {

    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    const response = await fetch("sidebar.html");

    sidebar.innerHTML = await response.text();

    const currentPage = location.pathname.split("/").pop();

    document.querySelectorAll(".nav-link").forEach(link => {

        if (link.getAttribute("href") === currentPage) {

            link.classList.add("active");

        }

    });

    const themeButton = document.getElementById("themeToggle");

    if (themeButton) {

        themeButton.addEventListener("click", () => {

            document.body.classList.toggle("light");

            localStorage.setItem(
                "theme",
                document.body.classList.contains("light")
                    ? "light"
                    : "dark"
            );

        });

    }

}

loadSidebar();

/* ==========================================
   RESTORE THEME
========================================== */

if (localStorage.getItem("theme") === "light") {

    document.body.classList.add("light");

}

/* ==========================================
   LOGOUT
========================================== */

document.getElementById("logoutBtn")?.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "index.html";

});

/* ==========================================
   LIVE CLOCK
========================================== */

const liveClock = document.getElementById("liveClock");

const liveDate = document.getElementById("liveDate");

function updateClock() {

    const now = new Date();

    liveClock.textContent = now.toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit"

    });

    liveDate.textContent = now.toLocaleDateString([], {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    });

}

updateClock();

setInterval(updateClock, 1000);

/* ==========================================
   TAB SWITCHING
========================================== */

const tabs = document.querySelectorAll(".clock-tab");

const sections = document.querySelectorAll(".clock-section");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));

        sections.forEach(section => section.classList.remove("active"));

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.tab)
            .classList.add("active");

    });

});

/* ==========================================
   GLOBAL VARIABLES
========================================== */

let alarms = [];

let timerInterval = null;

let stopwatchInterval = null;

let pomodoroInterval = null;

let stopwatchStart = 0;

let elapsed = 0;

/* ==========================================
   TIMER
========================================== */

let timerRemaining = 0;

const timerDisplay = document.getElementById("timerDisplay");

function updateTimerDisplay() {

    const hours = Math.floor(timerRemaining / 3600);
    const minutes = Math.floor((timerRemaining % 3600) / 60);
    const seconds = timerRemaining % 60;

    timerDisplay.textContent =
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}

document.getElementById("startTimer").addEventListener("click", () => {

    if (timerInterval) return;

    if (timerRemaining === 0) {

        timerRemaining =
            (Number(document.getElementById("timerHours").value) || 0) * 3600 +
            (Number(document.getElementById("timerMinutes").value) || 0) * 60 +
            (Number(document.getElementById("timerSeconds").value) || 0);

    }

    updateTimerDisplay();

    timerInterval = setInterval(() => {

        if (timerRemaining <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            alert("Timer finished!");

            return;

        }

        timerRemaining--;

        updateTimerDisplay();

    }, 1000);

});

document.getElementById("pauseTimer").addEventListener("click", () => {

    clearInterval(timerInterval);

    timerInterval = null;

});

document.getElementById("resetTimer").addEventListener("click", () => {

    clearInterval(timerInterval);

    timerInterval = null;

    timerRemaining = 0;

    updateTimerDisplay();

});

updateTimerDisplay();

/* ==========================================
   STOPWATCH
========================================== */

const stopwatchDisplay = document.getElementById("stopwatchDisplay");
const lapContainer = document.getElementById("lapContainer");

function updateStopwatch() {

    const total = elapsed;

    const minutes = Math.floor(total / 60000);

    const seconds = Math.floor((total % 60000) / 1000);

    const milliseconds = total % 1000;

    stopwatchDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;

}

document.getElementById("startStopwatch").addEventListener("click", () => {

    if (stopwatchInterval) return;

    stopwatchStart = Date.now() - elapsed;

    stopwatchInterval = setInterval(() => {

        elapsed = Date.now() - stopwatchStart;

        updateStopwatch();

    }, 10);

});

document.getElementById("resetStopwatch").addEventListener("click", () => {

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;

    elapsed = 0;

    lapContainer.innerHTML = "";

    updateStopwatch();

});

document.getElementById("lapStopwatch").addEventListener("click", () => {

    if (elapsed === 0) return;

    const lap = document.createElement("div");

    lap.className = "lap";

    lap.innerHTML = `
        <strong>Lap ${lapContainer.children.length + 1}</strong>
        <span>${stopwatchDisplay.textContent}</span>
    `;

    lapContainer.prepend(lap);

});

updateStopwatch();

/* ==========================================
   POMODORO
========================================== */

const pomodoroDisplay = document.getElementById("pomodoroDisplay");
const pomodoroStatus = document.getElementById("pomodoroStatus");

let pomodoroSeconds = 0;

function drawPomodoro() {

    const m = Math.floor(pomodoroSeconds / 60);

    const s = pomodoroSeconds % 60;

    pomodoroDisplay.textContent =
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

}

document.getElementById("startPomodoro").addEventListener("click", () => {

    clearInterval(pomodoroInterval);

    pomodoroSeconds =
        Number(document.getElementById("workMinutes").value) * 60;

    pomodoroStatus.textContent = "Focus Time";

    drawPomodoro();

    pomodoroInterval = setInterval(() => {

        pomodoroSeconds--;

        drawPomodoro();

        if (pomodoroSeconds <= 0) {

            clearInterval(pomodoroInterval);

            pomodoroInterval = null;

            pomodoroStatus.textContent = "Finished!";

            alert("Pomodoro complete!");

        }

    }, 1000);

});

document.getElementById("pausePomodoro").addEventListener("click", () => {

    clearInterval(pomodoroInterval);

    pomodoroInterval = null;

});

document.getElementById("resetPomodoro").addEventListener("click", () => {

    clearInterval(pomodoroInterval);

    pomodoroInterval = null;

    pomodoroSeconds =
        Number(document.getElementById("workMinutes").value) * 60;

    pomodoroStatus.textContent = "Ready to focus";

    drawPomodoro();

});

drawPomodoro();

/* ==========================================
   ALARMS
========================================== */

const alarmList = document.getElementById("alarmList");

function renderAlarms() {

    alarmList.innerHTML = "";

    alarms.forEach((alarm, index) => {

        const div = document.createElement("div");

        div.className = "alarm";

        div.innerHTML = `
            <div>
                <strong>${alarm.time}</strong><br>
                <small>${alarm.label}</small><br>
                <small>${alarm.days.join(", ")}</small>
            </div>

            <button data-index="${index}">Delete</button>
        `;

        div.querySelector("button").onclick = async () => {

            alarms.splice(index, 1);

            renderAlarms();

            await saveClock();

        };

        alarmList.appendChild(div);

    });

}

document.getElementById("addAlarm").addEventListener("click", async () => {

    const days = [];

    document.querySelectorAll(".alarm-day:checked").forEach(day => {

        days.push(day.value);

    });

    alarms.push({

        time: document.getElementById("alarmTime").value,

        label: document.getElementById("alarmLabel").value || "Alarm",

        days

    });

    renderAlarms();

    await saveClock();

});

/* ==========================================
   FIRESTORE
========================================== */

async function saveClock() {

    const user = auth.currentUser;

    if (!user) return;

    await setDoc(doc(db, "clock", user.uid), {

        alarms,

        workMinutes: document.getElementById("workMinutes").value,

        shortBreakMinutes: document.getElementById("shortBreakMinutes").value,

        longBreakMinutes: document.getElementById("longBreakMinutes").value

    });

}

async function loadClock() {

    const user = auth.currentUser;

    if (!user) return;

    const snap = await getDoc(doc(db, "clock", user.uid));

    if (!snap.exists()) return;

    const data = snap.data();

    alarms = data.alarms || [];

    renderAlarms();

    if (data.workMinutes)
        document.getElementById("workMinutes").value = data.workMinutes;

    if (data.shortBreakMinutes)
        document.getElementById("shortBreakMinutes").value = data.shortBreakMinutes;

    if (data.longBreakMinutes)
        document.getElementById("longBreakMinutes").value = data.longBreakMinutes;

}

onAuthStateChanged(auth, user => {

    if (user) {

        loadClock();

    } else {

        window.location.href = "index.html";

    }

});
