/* ==========================================
   CLOCK
========================================== */

const hourHand = document.getElementById("hourHand");

const minuteHand = document.getElementById("minuteHand");

const secondHand = document.getElementById("secondHand");

const digitalClock = document.getElementById("digitalClock");

const clockDate = document.getElementById("clockDate");


function updateClock() {

    const now = new Date();

    const hours = now.getHours();

    const minutes = now.getMinutes();

    const seconds = now.getSeconds();

    const milliseconds = now.getMilliseconds();


    // Smooth movement

    const secondDegrees =
        (seconds + milliseconds / 1000) * 6;

    const minuteDegrees =
        (minutes + seconds / 60) * 6;

    const hourDegrees =
        ((hours % 12) + minutes / 60) * 30;


    secondHand.style.transform =
        `translateX(-50%) rotate(${secondDegrees}deg)`;

    minuteHand.style.transform =
        `translateX(-50%) rotate(${minuteDegrees}deg)`;

    hourHand.style.transform =
        `translateX(-50%) rotate(${hourDegrees}deg)`;


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
