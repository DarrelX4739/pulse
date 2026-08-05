import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================
// TAB SWITCHING
// =====================================

const tabs =
    document.querySelectorAll(".clock-tab");

const panels =
    document.querySelectorAll(".clock-panel");

function showTab(name) {

    tabs.forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.tab === name
        );

    });

    panels.forEach(panel => {

        panel.classList.toggle(
            "active",
            panel.id === name
        );

    });

}

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        showTab(tab.dataset.tab);

    });

});

// =====================================
// LIVE CLOCK
// =====================================

const liveClock =
    document.getElementById("liveClock");

const liveDate =
    document.getElementById("liveDate");

function updateClock() {

    const now = new Date();

    liveClock.textContent =
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

    liveDate.textContent =
        now.toLocaleDateString([], {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}

setInterval(updateClock, 1000);

// =====================================
// TIMER
// =====================================

let timerSeconds = 0;

let timerInterval = null;

const timerDisplay =
    document.getElementById("timerDisplay");

const timerHours =
    document.getElementById("timerHours");

const timerMinutes =
    document.getElementById("timerMinutes");

const timerSecondsInput =
    document.getElementById("timerSeconds");

const startTimer =
    document.getElementById("startTimer");

const resetTimer =
    document.getElementById("resetTimer");

function updateTimer() {

    const h =
        Math.floor(timerSeconds / 3600)
            .toString()
            .padStart(2, "0");

    const m =
        Math.floor((timerSeconds % 3600) / 60)
            .toString()
            .padStart(2, "0");

    const s =
        (timerSeconds % 60)
            .toString()
            .padStart(2, "0");

    timerDisplay.textContent =
        `${h}:${m}:${s}`;

}

startTimer.addEventListener("click", () => {

    if (timerInterval) return;

    if (timerSeconds === 0) {

        timerSeconds =
            Number(timerHours.value) * 3600 +
            Number(timerMinutes.value) * 60 +
            Number(timerSecondsInput.value);

    }

    if (timerSeconds <= 0) return;

    updateTimer();

    timerInterval = setInterval(() => {

        timerSeconds--;

        updateTimer();

        if (timerSeconds <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            if (Notification.permission === "granted") {

                new Notification("Timer Finished!");

            }

        }

    }, 1000);

});

resetTimer.addEventListener("click", () => {

    clearInterval(timerInterval);

    timerInterval = null;

    timerSeconds = 0;

    updateTimer();

});

// =====================================
// STOPWATCH
// =====================================

let stopwatchSeconds = 0;

let stopwatchInterval = null;

const stopwatchDisplay =
    document.getElementById("stopwatchDisplay");

const startStopwatch =
    document.getElementById("startStopwatch");

const resetStopwatch =
    document.getElementById("resetStopwatch");

function updateStopwatch() {

    const h =
        Math.floor(stopwatchSeconds / 3600)
            .toString()
            .padStart(2, "0");

    const m =
        Math.floor((stopwatchSeconds % 3600) / 60)
            .toString()
            .padStart(2, "0");

    const s =
        (stopwatchSeconds % 60)
            .toString()
            .padStart(2, "0");

    stopwatchDisplay.textContent =
        `${h}:${m}:${s}`;

}

startStopwatch.addEventListener("click", () => {

    if (stopwatchInterval) {

        clearInterval(stopwatchInterval);

        stopwatchInterval = null;

        startStopwatch.textContent = "Start";

        return;

    }

    startStopwatch.textContent = "Pause";

    stopwatchInterval = setInterval(() => {

        stopwatchSeconds++;

        updateStopwatch();

    }, 1000);

});

resetStopwatch.addEventListener("click", () => {

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;

    stopwatchSeconds = 0;

    startStopwatch.textContent = "Start";

    updateStopwatch();

});

// =====================================
// ALARMS
// =====================================

let alarms = [];

const alarmTime =
    document.getElementById("alarmTime");

const addAlarm =
    document.getElementById("addAlarm");

const alarmList =
    document.getElementById("alarmList");

function renderAlarms() {

    alarmList.innerHTML = "";

    alarms.forEach((alarm, index) => {

        alarmList.innerHTML += `

            <div class="alarm-item">

                <span>${alarm.time}</span>

                <button onclick="deleteAlarm(${index})">
                    Delete
                </button>

            </div>

        `;

    });

}

window.deleteAlarm = function(index) {

    alarms.splice(index, 1);

    renderAlarms();

    if (window.saveClock) {

        window.saveClock();

    }

};

addAlarm.addEventListener("click", () => {

    if (!alarmTime.value) return;

    alarms.push({

        time: alarmTime.value

    });

    renderAlarms();

    if (window.saveClock) {

        window.saveClock();

    }

});

// =====================================
// POMODORO
// =====================================

let pomodoroRunning = false;
let pomodoroTime = 25 * 60;
let pomodoroInterval = null;
let pomodoroWork = true;

const pomodoroDisplay =
    document.getElementById("pomodoroDisplay");

const pomodoroStatus =
    document.getElementById("pomodoroStatus");

const startPomodoro =
    document.getElementById("startPomodoro");

const resetPomodoro =
    document.getElementById("resetPomodoro");

function updatePomodoro() {

    const minutes =
        Math.floor(pomodoroTime / 60)
            .toString()
            .padStart(2, "0");

    const seconds =
        (pomodoroTime % 60)
            .toString()
            .padStart(2, "0");

    pomodoroDisplay.textContent =
        `${minutes}:${seconds}`;

    pomodoroStatus.textContent =
        pomodoroWork
            ? "Work Session"
            : "Break";

}

startPomodoro.addEventListener("click", () => {

    if (pomodoroRunning) {

        clearInterval(pomodoroInterval);

        pomodoroRunning = false;

        startPomodoro.textContent = "Start";

        return;

    }

    pomodoroRunning = true;

    startPomodoro.textContent = "Pause";

    pomodoroInterval = setInterval(() => {

        pomodoroTime--;

        if (pomodoroTime <= 0) {

            if (Notification.permission === "granted") {

                new Notification("Pomodoro Finished!");

            }

            pomodoroWork = !pomodoroWork;

            pomodoroTime =
                pomodoroWork
                    ? 25 * 60
                    : 5 * 60;

        }

        updatePomodoro();

    }, 1000);

});

resetPomodoro.addEventListener("click", () => {

    clearInterval(pomodoroInterval);

    pomodoroRunning = false;

    pomodoroWork = true;

    pomodoroTime = 25 * 60;

    startPomodoro.textContent = "Start";

    updatePomodoro();

});

// =====================================
// FIRESTORE
// =====================================

onAuthStateChanged(auth, (user) => {

    if (!user) return;

    const ref = doc(db, "clock", user.uid);

    onSnapshot(ref, (snap) => {

        if (!snap.exists()) return;

        const data = snap.data();

        alarms = data.alarms || [];

        renderAlarms();

    });

    async function saveClock() {

        await setDoc(
            ref,
            {
                alarms
            },
            {
                merge: true
            }
        );

    }

    window.saveClock = saveClock;

});

// =====================================
// CHECK ALARMS
// =====================================

setInterval(() => {

    const now = new Date();

    const current =
        now.toTimeString().slice(0, 5);

    alarms.forEach(alarm => {

        if (alarm.time === current) {

            if (Notification.permission === "granted") {

                new Notification("Alarm", {
                    body: `It's ${alarm.time}`
                });

            }

        }

    });

}, 1000);

// =====================================
// INITIALISE
// =====================================

if ("Notification" in window) {

    Notification.requestPermission();

}

showTab("clock");

updateClock();

updateTimer();

updateStopwatch();

updatePomodoro();
