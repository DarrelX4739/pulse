import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ======================
// Elements
// ======================

const newTaskBtn = document.getElementById("newTaskBtn");
const taskModal = document.getElementById("taskModal");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");

const saveTask = document.getElementById("saveTask");
const cancelTask = document.getElementById("cancelTask");

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");

let currentUser = null;

// ======================
// Modal
// ======================

newTaskBtn.addEventListener("click", () => {

    taskModal.style.display = "flex";

});

cancelTask.addEventListener("click", () => {

    taskModal.style.display = "none";

    clearInputs();

});

function clearInputs() {

    taskTitle.value = "";
    taskDescription.value = "";
    taskPriority.value = "high";
    taskDueDate.value = "";

}

// ======================
// Authentication
// ======================

onAuthStateChanged(auth, (user) => {

    if (!user) return;

    currentUser = user;

    listenForTasks();

});

// ======================
// Save Task
// ======================

saveTask.addEventListener("click", async () => {

    if (!currentUser) return;

    if (taskTitle.value.trim() === "") {

        alert("Please enter a task title.");

        return;

    }

    await addDoc(collection(db, "tasks"), {

        owner: currentUser.uid,

        title: taskTitle.value.trim(),

        description: taskDescription.value.trim(),

        priority: taskPriority.value,

        dueDate: taskDueDate.value,

        completed: false,

        created: serverTimestamp()

    });

    taskModal.style.display = "none";

    clearInputs();

});

// ======================
// Live Tasks
// ======================

function listenForTasks() {

    const q = query(

        collection(db, "tasks"),

        where("owner", "==", currentUser.uid),

        orderBy("created", "asc")

    );

    onSnapshot(q, (snapshot) => {

        const tasks = [];

        snapshot.forEach(doc => {

            tasks.push({

                id: doc.id,

                ...doc.data()

            });

        });

        renderTasks(tasks);

    });

}

// ======================
// Render
// ======================

function renderTasks(tasks) {

    taskList.innerHTML = "";

    totalTasks.textContent = tasks.length;

    completedTasks.textContent =
        tasks.filter(t => t.completed).length;

    remainingTasks.textContent =
        tasks.filter(t => !t.completed).length;

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <p class="empty-message">
                🎉 No tasks yet.
            </p>
        `;

        return;

    }

    const priorityOrder = {

        high: 0,

        medium: 1,

        low: 2

    };

    tasks.sort((a, b) => {

        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {

            return priorityOrder[a.priority] -
                   priorityOrder[b.priority];

        }

        return 0;

    });

    tasks.forEach(task => {

        const colour = {

            high: "🔴",

            medium: "🟠",

            low: "🟡"

        };

        taskList.innerHTML += `

        <div class="task-card">

            <h3>${colour[task.priority]} ${task.title}</h3>

            <p>${task.description || "No description"}</p>

            <small>Due: ${task.dueDate || "No due date"}</small>

        </div>

        `;

    });

}

