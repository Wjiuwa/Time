// Style switcher
function switchClockStyle(style) {
    document.querySelectorAll('.clock').forEach(clock => {
        clock.classList.remove('active');
    });
    document.querySelector('.' + style + '-clock').classList.add('active');
}

document.getElementById('clockStyle').addEventListener('change', function (e) {
    switchClockStyle(e.target.value);
});

// Initialize with analog clock
switchClockStyle('analog');

// Combined update function for all clock types
function updateAllClocks() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    // Update analog clock
    const secondDegrees = (seconds / 60) * 360;
    const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
    const hourDegrees = ((hours + minutes / 60) / 12) * 360;

    const analogSecond = document.querySelector('.analog-clock .second');
    const analogMinute = document.querySelector('.analog-clock .minute');
    const analogHour = document.querySelector('.analog-clock .hour');

    if (analogSecond) analogSecond.style.transform = `rotate(${secondDegrees}deg)`;
    if (analogMinute) analogMinute.style.transform = `rotate(${minuteDegrees}deg)`;
    if (analogHour) analogHour.style.transform = `rotate(${hourDegrees}deg)`;

    // Update digital clock
    document.getElementById("day").innerText = days[now.getDay()];
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');

    // Update flip clock
    updateFlipCard("flip-hours", hours);
    updateFlipCard("flip-minutes", minutes);
    updateFlipCard("flip-seconds", seconds);

    // Update circular clock
    updateCircularClock(hours, minutes, seconds);
}

// Helper function for flip clock
function updateFlipCard(id, newValue) {
    const card = document.getElementById(id);
    if (!card) return;

    const formattedValue = newValue.toString().padStart(2, '0');
    const currentValue = card.querySelector(".top .top-number").innerText;

    if (formattedValue === currentValue) return;

    // Update next-top and next-bottom first
    card.querySelectorAll('.next-top .top-number').forEach(el => {
        el.textContent = formattedValue;
    });

    card.classList.add("flip");

    // Wait for the flip animation to complete before updating bottom
    setTimeout(() => {
        card.querySelectorAll('.bottom .bottom-number, .next-bottom .bottom-number').forEach(el => {
            el.textContent = formattedValue;
        });
        card.querySelector('.top .top-number').textContent = formattedValue;
        card.classList.remove("flip");
    }, 600); // Full animation duration
}

// Helper function for circular clock
function updateCircularClock(hours, minutes, seconds) {
    const hourCircle = document.querySelector('.circular-clock .circle.hours svg circle:nth-child(2)');
    const minuteCircle = document.querySelector('.circular-clock .circle.minutes svg circle:nth-child(2)');
    const secondCircle = document.querySelector('.circular-clock .circle.seconds svg circle:nth-child(2)');

    const circularHours = document.getElementById('circular-hours');
    const circularMinutes = document.getElementById('circular-minutes');
    const circularSeconds = document.getElementById('circular-seconds');

    circularHours.innerText = String(hours).padStart(2, '0');
    circularMinutes.innerText = String(minutes).padStart(2, '0');
    circularSeconds.innerText = String(seconds).padStart(2, '0');

    // Circumference of a circle with r=45 is approx 283 (2 * Math.PI * 45)
    const hourProgress = ((hours % 12) / 12) * 283;
    const minuteProgress = (minutes / 60) * 283;
    const secondProgress = (seconds / 60) * 283;

    if (hourCircle) hourCircle.setAttribute('stroke-dasharray', `${hourProgress} 283`);
    if (minuteCircle) minuteCircle.setAttribute('stroke-dasharray', `${minuteProgress} 283`);
    if (secondCircle) secondCircle.setAttribute('stroke-dasharray', `${secondProgress} 283`);
}

// Start the clock updates
setInterval(updateAllClocks, 1000);
updateAllClocks();