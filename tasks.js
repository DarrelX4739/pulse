import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    doc
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
const completedTaskList = document.getElementById("completedTaskList");

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
// Add Task
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
// Firebase Listener
// ======================

function listenForTasks() {

    const q = query(

        collection(db, "tasks"),

        where("owner", "==", currentUser.uid)

    );

    onSnapshot(q, (snapshot) => {

        const tasks = [];

        snapshot.forEach(item => {

            tasks.push({

                id: item.id,

                ...item.data()

            });

        });

        renderTasks(tasks);

    });

}
// ======================
// Toggle Complete
// ======================

async function toggleComplete(id, status) {

    await updateDoc(

        doc(db, "tasks", id),

        {

            completed: !status

        }

    );

}



// ======================
// Delete Task
// ======================

async function deleteTask(id) {

    await deleteDoc(

        doc(db, "tasks", id)

    );

}



// ======================
// Render Tasks
// ======================

function renderTasks(tasks) {

    taskList.innerHTML = "";

    completedTaskList.innerHTML = "";



    totalTasks.textContent = tasks.length;

    completedTasks.textContent =
        tasks.filter(task => task.completed).length;

    remainingTasks.textContent =
        tasks.filter(task => !task.completed).length;



    const priorityOrder = {

        high: 0,

        medium: 1,

        low: 2

    };



    // ======================
    // Sort:
    // 1. Due Date
    // 2. Priority
    // 3. Created
    // ======================

    tasks.sort((a, b) => {

        const dateA = a.dueDate || "9999-12-31";
        const dateB = b.dueDate || "9999-12-31";

        if (dateA !== dateB) {

            return dateA.localeCompare(dateB);

        }

        const priorityDiff =
            priorityOrder[a.priority] -
            priorityOrder[b.priority];

        if (priorityDiff !== 0) {

            return priorityDiff;

        }

        const createdA = a.created?.seconds ?? 0;
        const createdB = b.created?.seconds ?? 0;

        return createdA - createdB;

    });



    const active =
        tasks.filter(task => !task.completed);

    const completed =
        tasks.filter(task => task.completed);



    if (active.length === 0) {

        taskList.innerHTML = `

        <p class="empty-message">

            🎉 No active tasks.

        </p>

        `;

    }



    active.forEach(task => {

        taskList.innerHTML += createTaskCard(task);

    });



    if (completed.length === 0) {

        completedTaskList.innerHTML = `

        <p class="empty-message">

            No completed tasks.

        </p>

        `;

    }



    completed.forEach(task => {

        completedTaskList.innerHTML += createTaskCard(task);

    });



    addButtonEvents();

}



// ======================
// Task Card
// ======================

function createTaskCard(task) {

    const priorityIcon = {

        high: "🔴",

        medium: "🟠",

        low: "🟡"

    };



    return `

    <div class="task-card">

        <div class="task-main">

            <h3>

                ${priorityIcon[task.priority]} ${task.title}

            </h3>

            <p>

                ${task.description || "No description"}

            </p>

            <small class="task-date">

                Due: ${task.dueDate || "No due date"}

            </small>

        </div>

        <div class="task-actions">

            <button

                class="complete-btn"

                data-id="${task.id}"

                data-completed="${task.completed}">

                ${task.completed ? "☑" : "☐"}

            </button>

            <button

                class="delete-btn"

                data-id="${task.id}">

                🗑

            </button>

        </div>

    </div>

    `;

}



// ======================
// Button Listeners
// ======================

function addButtonEvents() {

    document.querySelectorAll(".complete-btn")

        .forEach(button => {

            button.addEventListener("click", () => {

                toggleComplete(

                    button.dataset.id,

                    button.dataset.completed === "true"

                );

            });

        });



    document.querySelectorAll(".delete-btn")

        .forEach(button => {

            button.addEventListener("click", () => {

                deleteTask(

                    button.dataset.id

                );

            });

        });

}
