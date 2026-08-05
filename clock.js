import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================
// TAB SWITCHING
// =====================================

const tabs = document.querySelectorAll(".clock-tab");
const panels = document.querySelectorAll(".clock-panel");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.target)
            .classList.add("active");

    });

});


// =====================================
// LIVE CLOCK
// =====================================

const clockDisplay =
    document.getElementById("clockDisplay");

const clockDate =
    document.getElementById("clockDate");

function updateClock(){

    if(!clockDisplay) return;

    const now = new Date();

    clockDisplay.textContent =
        now.toLocaleTimeString([],{

            hour:"2-digit",
            minute:"2-digit",
            second:"2-digit"

        });

    clockDate.textContent =
        now.toLocaleDateString([],{

            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"

        });

}

updateClock();

setInterval(updateClock,1000);


// =====================================
// STOPWATCH
// =====================================

let stopwatchTime = 0;

let stopwatchRunning = false;

let stopwatchInterval = null;

const stopwatchDisplay =
    document.getElementById("stopwatchDisplay");

const laps =
    document.getElementById("laps");


function formatMS(ms){

    const minutes =
        Math.floor(ms/60000);

    const seconds =
        Math.floor((ms%60000)/1000);

    const millis =
        Math.floor((ms%1000)/10);

    return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(millis).padStart(2,"0")}`;

}

function updateStopwatch(){

    stopwatchDisplay.textContent =
        formatMS(stopwatchTime);

}

document
.getElementById("swStart")
?.addEventListener("click",()=>{

    if(stopwatchRunning) return;

    stopwatchRunning=true;

    const start =
        Date.now()-stopwatchTime;

    stopwatchInterval=setInterval(()=>{

        stopwatchTime=
            Date.now()-start;

        updateStopwatch();

    },10);

});


document
.getElementById("swPause")
?.addEventListener("click",()=>{

    stopwatchRunning=false;

    clearInterval(stopwatchInterval);

});


document
.getElementById("swReset")
?.addEventListener("click",()=>{

    stopwatchRunning=false;

    clearInterval(stopwatchInterval);

    stopwatchTime=0;

    laps.innerHTML="";

    updateStopwatch();

});


document
.getElementById("swLap")
?.addEventListener("click",()=>{

    if(stopwatchTime===0) return;

    const lap=document.createElement("div");

    lap.className="lap";

    lap.innerHTML=`

        <span>Lap ${laps.children.length+1}</span>

        <span>${formatMS(stopwatchTime)}</span>

    `;

    laps.prepend(lap);

});

updateStopwatch();


// =====================================
// COUNTDOWN TIMER
// =====================================

let timerSeconds=0;

let timerInterval;

const timerDisplay =
    document.getElementById("timerDisplay");

function drawTimer(){

    const m =
        Math.floor(timerSeconds/60);

    const s =
        timerSeconds%60;

    timerDisplay.textContent=

        `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

}

drawTimer();

document
.getElementById("timerStart")
?.addEventListener("click",()=>{

    const mins =
        Number(document.getElementById("timerMinutes").value)||0;

    const secs =
        Number(document.getElementById("timerSeconds").value)||0;

    timerSeconds =
        mins*60+secs;

    drawTimer();

    clearInterval(timerInterval);

    timerInterval=setInterval(()=>{

        if(timerSeconds<=0){

            clearInterval(timerInterval);

            alert("Timer finished!");

            return;

        }

        timerSeconds--;

        drawTimer();

    },1000);

});

// =====================================
// POMODORO
// =====================================

let pomodoroInterval;

let pomodoroSeconds = 0;

let onBreak = false;

const pomodoroDisplay =
    document.getElementById("pomodoroDisplay");

function drawPomodoro() {

    const m = Math.floor(pomodoroSeconds / 60);

    const s = pomodoroSeconds % 60;

    pomodoroDisplay.textContent =
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

}

document.getElementById("pomodoroStart")?.addEventListener("click", () => {

    clearInterval(pomodoroInterval);

    const work =
        Number(document.getElementById("workMinutes").value) || 25;

    const brk =
        Number(document.getElementById("breakMinutes").value) || 5;

    onBreak = false;

    pomodoroSeconds = work * 60;

    drawPomodoro();

    pomodoroInterval = setInterval(() => {

        pomodoroSeconds--;

        drawPomodoro();

        if (pomodoroSeconds <= 0) {

            if (!onBreak) {

                alert("Work session complete!");

                onBreak = true;

                pomodoroSeconds = brk * 60;

            }

            else {

                alert("Break finished!");

                onBreak = false;

                pomodoroSeconds = work * 60;

            }

        }

    }, 1000);

});

document.getElementById("pomodoroReset")?.addEventListener("click", () => {

    clearInterval(pomodoroInterval);

    pomodoroSeconds = 0;

    drawPomodoro();

});

drawPomodoro();


// =====================================
// ALARMS
// =====================================

let alarms = [];

const alarmList =
    document.getElementById("alarmList");

function renderAlarms() {

    if (!alarmList) return;

    alarmList.innerHTML = "";

    alarms.forEach((alarm, index) => {

        const div = document.createElement("div");

        div.className = "alarm";

        div.innerHTML = `

            <div>

                <strong>${alarm.time}</strong>

                <br>

                <small>${alarm.days.join(", ")}</small>

            </div>

            <button onclick="deleteAlarm(${index})">

                Delete

            </button>

        `;

        alarmList.appendChild(div);

    });

}

window.deleteAlarm = async function(index) {

    alarms.splice(index, 1);

    renderAlarms();

    await saveClockData();

};

document.getElementById("addAlarm")?.addEventListener("click", async () => {

    const time =
        document.getElementById("alarmTime").value;

    if (!time) return;

    const selectedDays = [];

    document
        .querySelectorAll(".alarm-day:checked")
        .forEach(day => {

            selectedDays.push(day.value);

        });

    alarms.push({

        time,

        days: selectedDays

    });

    renderAlarms();

    await saveClockData();

});


// =====================================
// CHECK ALARMS
// =====================================

setInterval(() => {

    const now = new Date();

    const time =
        now.toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit",

            hour12: false

        });

    const weekday =
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];

    alarms.forEach(alarm => {

        if (

            alarm.time === time &&

            alarm.days.includes(weekday)

        ) {

            alert("Alarm!");

        }

    });

}, 1000);


// =====================================
// FIRESTORE SAVE / LOAD
// =====================================

async function saveClockData() {

    const user = auth.currentUser;

    if (!user) return;

    await setDoc(

        doc(db, "clock", user.uid),

        {

            alarms,

            workMinutes:

                document.getElementById("workMinutes")?.value || 25,

            breakMinutes:

                document.getElementById("breakMinutes")?.value || 5

        }

    );

}

async function loadClockData() {

    const user = auth.currentUser;

    if (!user) return;

    const snapshot =
        await getDoc(doc(db, "clock", user.uid));

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    alarms = data.alarms || [];

    renderAlarms();

    if (document.getElementById("workMinutes"))

        document.getElementById("workMinutes").value =
            data.workMinutes ?? 25;

    if (document.getElementById("breakMinutes"))

        document.getElementById("breakMinutes").value =
            data.breakMinutes ?? 5;

}

auth.onAuthStateChanged?.((user) => {

    if (user) {

        loadClockData();

    }

});
