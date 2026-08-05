import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================
// LOAD SIDEBAR
// =====================================

async function loadSidebar() {

    const sidebarContainer = document.getElementById("sidebar");

    if (!sidebarContainer) return;

    try {

        const response = await fetch("sidebar.html");

        sidebarContainer.innerHTML = await response.text();

        setupSidebar();

    }

    catch (error) {

        console.error("Unable to load sidebar:", error);

    }

}

function setupSidebar() {

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "");

    document.querySelectorAll(".nav-link").forEach(link => {

        if (link.dataset.page === page) {

            link.classList.add("active");

        }

    });


    const themeToggle =
        document.getElementById("themeToggle");


    if (!themeToggle) return;


    const savedTheme =
        localStorage.getItem("theme") || "dark";


    document.body.classList.toggle(
        "light",
        savedTheme === "light"
    );


    themeToggle.textContent =
        savedTheme === "light"
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";


    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light");


        const light =
            document.body.classList.contains("light");


        localStorage.setItem(
            "theme",
            light ? "light" : "dark"
        );


        themeToggle.textContent =
            light
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";

    });

}


loadSidebar();


// =====================================
// CONFIG
// =====================================

const ALLOWED_UID = "WzbTdt1HZKQPPiROrt413PtHudH3";
const USER_NAME = "Darrel";


// =====================================
// ELEMENTS
// =====================================

// Login

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");


// Dashboard

const logoutBtn = document.getElementById("logoutBtn");

const greetingElement =
    document.getElementById("greeting");

const quoteElement =
    document.getElementById("quote");

const timeElement =
    document.getElementById("time");

const dateElement =
    document.getElementById("date");


// ==============================
// ADDED: TASK ELEMENTS
// ==============================

const todayTasks =
    document.getElementById("todayTasks");

const overviewCompleted =
    document.getElementById("overviewCompleted");

const overviewHigh =
    document.getElementById("overviewHigh");

const overviewMedium =
    document.getElementById("overviewMedium");

const overviewLow =
    document.getElementById("overviewLow");


const completionPercent =
    document.getElementById("completionPercent");


const completedCount =
    document.getElementById("completedCount");

const highCount =
    document.getElementById("highCount");

const mediumCount =
    document.getElementById("mediumCount");

const lowCount =
    document.getElementById("lowCount");


// =====================================
// QUOTES
// =====================================

const quotes = [

    "Obstacles are the cost of greatness.",
    "Stay focused.",
    "Progress beats perfection.",
    "Small steps matter.",
    "Keep moving forward.",
    "Finish what you started.",
    "Consistency wins.",
    "Dream. Plan. Do.",
    "Today's effort matters.",
    "Learn something new.",
    "Discipline creates freedom.",
    "Never stop improving.",
    "If you fell yesterday, stand today.",
    "Keep building.",
    "Growth takes time.",
    "Stay curious.",
    "Choose progress.",
    "One task first.",
    "He who is brave is free.",
    "Think. Build. Repeat.",
    "Momentum changes everything.",
    "Focus creates results.",
    "Build daily habits.",
    "Keep showing up.",
    "Patience builds success.",
    "Stay hungry.",
    "Work smarter.",
    "I can and I will.",
    "Trust the process.",
    "Keep learning.",
    "Push forward.",
    "Take the first step.",
    "Every day counts.",
    "One percent better.",
    "Create your future.",
    "Keep improving.",
    "Success takes consistency.",
    "Stay determined.",
    "Pressure makes diamonds.",
    "Start now.",
    "Finish strong.",
    "Build momentum.",
    "Be unstoppable.",
    "Make today count.",
    "Keep your promise.",
    "Success loves action.",
    "Stay resilient.",
    "Think bigger.",
    "Stay positive.",
    "Never give up."

];


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

        loginBtn.textContent =
            "Signing In...";


        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email.value.trim(),
                    password.value
                );


            if (
                userCredential.user.uid !== ALLOWED_UID
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
        (event)=>{

            if(event.key==="Enter"){

                login();

            }

        }
    );

}

// =====================================
// LOGOUT
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "index.html";

    });

}



// =====================================
// AUTH CHECK
// =====================================

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



    // ==========================
    // ADDED: LOAD TASKS
    // ==========================

    if (isDashboard) {

        loadDashboardTasks(user);

    }



    if (isLogin) {

        window.location.href =
            "dashboard.html";

    }


});




// =====================================
// DASHBOARD
// =====================================

function updateDashboard() {


    if (!timeElement || !dateElement) {

        return;

    }


    const now = new Date();



    // Greeting

    if (greetingElement) {


        const hour =
            now.getHours();


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
            `${greeting}, ${USER_NAME} 👋`;

    }




    // Quote

    if (quoteElement) {


        const startOfYear =
            new Date(now.getFullYear(), 0, 0);



        const dayNumber =
            Math.floor(
                (now - startOfYear) / 86400000
            );



        quoteElement.textContent =
            quotes[
                dayNumber % quotes.length
            ];

    }




    // Time

    timeElement.textContent =
        now.toLocaleTimeString([], {

            hour:"2-digit",

            minute:"2-digit",

            second:"2-digit"

        });




    // Date

    dateElement.textContent =
        now.toLocaleDateString([], {

            weekday:"long",

            day:"numeric",

            month:"long",

            year:"numeric"

        });


}



// =====================================
// TASK OVERVIEW
// =====================================

function loadDashboardTasks(user) {


    const q = query(

        collection(db,"tasks"),

        where("owner","==",user.uid),

        orderBy("created","asc")

    );



    onSnapshot(q,(snapshot)=>{


        const tasks = [];



        snapshot.forEach(doc=>{


            tasks.push({

                id:doc.id,

                ...doc.data()

            });


        });



        updateTaskOverview(tasks);

        updateTodayTasks(tasks);


    });


}




function updateTaskOverview(tasks) {


    if (!overviewCompleted) return;



    const total =
        tasks.length;



    if(total === 0){


        overviewCompleted.style.width="0%";

        overviewHigh.style.width="0%";

        overviewMedium.style.width="0%";

        overviewLow.style.width="0%";



        completionPercent.textContent="0%";


        completedCount.textContent="🟢 0";

        highCount.textContent="🔴 0";

        mediumCount.textContent="🟠 0";

        lowCount.textContent="🟡 0";


        return;

    }




    const completed =
        tasks.filter(t=>t.completed).length;



    const high =
        tasks.filter(t=>

            !t.completed &&
            t.priority==="high"

        ).length;



    const medium =
        tasks.filter(t=>

            !t.completed &&
            t.priority==="medium"

        ).length;



    const low =
        tasks.filter(t=>

            !t.completed &&
            t.priority==="low"

        ).length;





    overviewCompleted.style.width =
        `${completed / total * 100}%`;



    overviewHigh.style.width =
        `${high / total * 100}%`;



    overviewMedium.style.width =
        `${medium / total * 100}%`;



    overviewLow.style.width =
        `${low / total * 100}%`;





    completionPercent.textContent =
        `${Math.round(
            completed / total * 100
        )}%`;





    completedCount.textContent =
        `🟢 ${completed}`;


    highCount.textContent =
        `🔴 ${high}`;


    mediumCount.textContent =
        `🟠 ${medium}`;


    lowCount.textContent =
        `🟡 ${low}`;


}




// =====================================
// TODAY'S TASKS
// =====================================

function updateTodayTasks(tasks) {


    if(!todayTasks) return;



    const today =
        new Date()
            .toISOString()
            .split("T")[0];



    const todaysTasks =
        tasks.filter(task =>

            task.dueDate === today &&
            !task.completed

        );




    if(todaysTasks.length === 0){


        todayTasks.innerHTML = `

            <p class="empty-message">

                🎉 Woohoo! You're all caught up.

            </p>

        `;


        return;

    }




    todayTasks.innerHTML = "";




    todaysTasks
    .slice(0,3)
    .forEach(task=>{


        todayTasks.innerHTML += `


            <div class="task-card ${task.priority}">


                <div class="task-main">


                    <h3>
                        ${task.title}
                    </h3>


                    <p>
                        ${task.description || "No description"}
                    </p>


                </div>


            </div>


        `;


    });


}




// =====================================
// START DASHBOARD
// =====================================

if (timeElement && dateElement) {


    updateDashboard();


    setInterval(
        updateDashboard,
        1000
    );


}


loadSidebar();
