/**
 * Clean & Modular Clock Implementation
 * Organized using classes and separated concerns for better maintainability
 */

class TimeUtils {
    static getCurrentTime() {
        const now = new Date();
        return {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            day: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][now.getDay()]
        };
    }

    static formatTime(value) {
        return String(value).padStart(2, '0');
    }

    static calculateDegrees(value, max) {
        return (value / max) * 360;
    }

    static calculateProgress(value, max, circumference = 283) {
        return (value / max) * circumference;
    }
}

class SandParticleSystem {
    constructor(hourglassElement) {
        this.hourglass = hourglassElement;
        this.particles = [];
        this.isActive = false;
        this.particleInterval = null;

        // Constants for particle animation (adjusted for 1-hour flow)
        // These are percentages relative to the hourglass container's dimensions.
        // You might need to fine-tune these if your CSS dimensions change.
        this.NECK_Y_PERCENT = 54; // Y position of neck in % relative to hourglass height, slightly above 50%
        this.NECK_X_PERCENT = 50; // X position of neck in % relative to hourglass width
        this.PARTICLE_START_Y_OFFSET = 5; // Start particles slightly above the neck, within the top sand
        this.PARTICLE_MIN_DURATION = 1500; // ms - increased for longer flow
        this.PARTICLE_MAX_DURATION_ADDITION = 1000; // ms - increased
        this.PARTICLE_START_X_DRIFT_RANGE = 4; // %
        this.PARTICLE_END_X_DRIFT_RANGE = 10; // %
        this.CHAMBER_MIN_X_PERCENT = 15; // Inner-most x-coords of bottom chamber
        this.CHAMBER_MAX_X_PERCENT = 85; // Outer-most x-coords of bottom chamber
        this.BOTTOM_END_Y_PERCENT = 100; // Where particles settle in the bottom chamber

        // Adjust particle spawn rate for 1-hour duration.
        // We want a steady stream over an hour, so a particle every ~150ms is reasonable.
        this.PARTICLE_SPAWN_RATE_MS = 150; // Milliseconds between new particle spawns
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;

        this.cleanup(); // Cleanup any existing particles first

        this.particleInterval = setInterval(() => {
            if (this.shouldCreateParticle()) {
                this.createParticle();
            }
        }, this.PARTICLE_SPAWN_RATE_MS);
    }

    stop() {
        this.isActive = false;
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }
        this.cleanup();
    }

    shouldCreateParticle() {
        const topSand = this.hourglass.querySelector('.top-sand');
        if (!topSand) return false;

        // Only create particles if there's sand in the top chamber AND it's flowing
        // We check for a height greater than a small threshold (e.g., 1%)
        const heightPercent = parseFloat(topSand.style.height);
        return heightPercent > 1;
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'sand-particle';

        // Start particles from just above the neck, within the top sand mass
        // Use percentages for positioning
        const startX = this.NECK_X_PERCENT + (Math.random() - 0.5) * this.PARTICLE_START_X_DRIFT_RANGE;
        const startY = this.NECK_Y_PERCENT - this.PARTICLE_START_Y_OFFSET;

        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;

        this.hourglass.appendChild(particle);
        this.animateParticle(particle);
    }

    animateParticle(particle) {
        const startTime = Date.now();
        const duration = this.PARTICLE_MIN_DURATION + Math.random() * this.PARTICLE_MAX_DURATION_ADDITION;

        const startY = parseFloat(particle.style.top);
        const endY = this.BOTTOM_END_Y_PERCENT; // End Y position (bottom of hourglass, adjusted for visual)

        const startX = parseFloat(particle.style.left);
        const drift = (Math.random() - 0.5) * this.PARTICLE_END_X_DRIFT_RANGE;
        // Ensure endX stays within the chamber bounds
        const endX = Math.max(this.CHAMBER_MIN_X_PERCENT, Math.min(this.CHAMBER_MAX_X_PERCENT, startX + drift));

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Using ease-out for a more natural falling effect (gravity)
            const easeProgress = 1 - Math.pow(1 - progress, 2); // Ease-out quadratic

            const currentY = startY + (endY - startY) * easeProgress;
            const currentX = startX + (endX - startX) * easeProgress;

            particle.style.top = `${currentY}%`;
            particle.style.left = `${currentX}%`;

            if (progress > 0.8) {
                // Fade out towards the end of its journey
                particle.style.opacity = 1 - ((progress - 0.8) / 0.2);
            }

            if (progress < 1) {
                this.animationFrameId = requestAnimationFrame(animate); // Store ID for potential cancellation
            } else {
                particle.remove(); // Remove particle once it reaches the bottom
            }
        };

        requestAnimationFrame(animate);
    }

    cleanup() {
        this.hourglass.querySelectorAll('.sand-particle').forEach(particle => {
            particle.remove();
        });
        this.particles = []; // Clear array of particles
    }
}

class ClockRenderer {
    constructor() {
        this.elements = this.cacheElements();
        // Initialize dot elements arrays
        this.hourglassHourDots = [];
        this.hourglassMinuteDots = [];
    }

    cacheElements() {
        return {
            day: document.getElementById('day'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),

            analogHour: document.querySelector('.analog-clock .hour'),
            analogMinute: document.querySelector('.analog-clock .minute'),
            analogSecond: document.querySelector('.analog-clock .second'),

            circularHours: document.getElementById('circular-hours'),
            circularMinutes: document.getElementById('circular-minutes'),
            circularSeconds: document.getElementById('circular-seconds'),
            hourCircle: document.querySelector('.circular-clock .circle.hours svg circle:nth-child(2)'),
            minuteCircle: document.querySelector('.circular-clock .circle.minutes svg circle:nth-child(2)'),
            secondCircle: document.querySelector('.circular-clock .circle.seconds svg circle:nth-child(2)'),

            hourglassDotsContainer: document.getElementById('hourDots'), // Container for all hourglass dots
        };
    }

    updateDigital(time) {
        const { day, hours, minutes, seconds } = this.elements;
        if (day) day.textContent = time.day;
        if (hours) hours.textContent = TimeUtils.formatTime(time.hours);
        if (minutes) minutes.textContent = TimeUtils.formatTime(time.minutes);
        if (seconds) seconds.textContent = TimeUtils.formatTime(time.seconds);
    }

    updateAnalog(time) {
        const { analogSecond, analogMinute, analogHour } = this.elements;

        const secondDegrees = TimeUtils.calculateDegrees(time.seconds, 60);
        const minuteDegrees = TimeUtils.calculateDegrees(time.minutes + time.seconds / 60, 60);
        const hourDegrees = TimeUtils.calculateDegrees(time.hours + time.minutes / 60, 12);

        if (analogSecond) analogSecond.style.transform = `rotate(${secondDegrees}deg)`;
        if (analogMinute) analogMinute.style.transform = `rotate(${minuteDegrees}deg)`;
        if (analogHour) analogHour.style.transform = `rotate(${hourDegrees}deg)`;
    }

    updateCircular(time) {
        const { circularHours, circularMinutes, circularSeconds, hourCircle, minuteCircle, secondCircle } = this.elements;

        if (circularHours) circularHours.textContent = TimeUtils.formatTime(time.hours);
        if (circularMinutes) circularMinutes.textContent = TimeUtils.formatTime(time.minutes);
        if (circularSeconds) circularSeconds.textContent = TimeUtils.formatTime(time.seconds);

        const hourProgress = TimeUtils.calculateProgress(time.hours % 12, 12);
        const minuteProgress = TimeUtils.calculateProgress(time.minutes, 60);
        const secondProgress = TimeUtils.calculateProgress(time.seconds, 60);

        if (hourCircle) hourCircle.setAttribute('stroke-dasharray', `${hourProgress} 283`);
        if (minuteCircle) minuteCircle.setAttribute('stroke-dasharray', `${minuteProgress} 283`);
        if (secondCircle) secondCircle.setAttribute('stroke-dasharray', `${secondProgress} 283`);
    }

    // Initializes all the hourglass dots (called once on hourglass activation)
    initHourglassDots() {
        const dotsContainer = this.elements.hourglassDotsContainer;
        if (!dotsContainer) return;

        // Clear any existing dots first
        dotsContainer.innerHTML = '';
        this.hourglassHourDots = [];
        this.hourglassMinuteDots = [];

        // Get the current dimensions of the hourglass container to position dots accurately
        const containerWidth = dotsContainer.offsetWidth;
        const containerHeight = dotsContainer.offsetHeight;

        // Adjust dotRadius and center based on your hourglass visual.
        // Aim to place dots around the 'waist' of the hourglass.
        // Assuming hourglass is roughly circular around its middle.
        const dotRadius = Math.min(containerWidth, containerHeight) / 2 * 0.9; // 90% of half the smaller dimension
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        for (let i = 0; i < 60; i++) {
            const dot = document.createElement('div');
            dot.classList.add('hourglass-dot'); // General class for all dots

            const angle = (i / 60) * 360 - 90; // Angle for each minute, starting from top (-90 degrees offset)
            const rad = (angle * Math.PI) / 180; // Convert to radians

            const x = centerX + dotRadius * Math.cos(rad);
            const y = centerY + dotRadius * Math.sin(rad);

            // Determine dot size for centering
            const dotSize = (i % 5 === 0) ? 6 : 4; // Hour marks are larger
            dot.style.width = `${dotSize}px`;
            dot.style.height = `${dotSize}px`;

            // Position the dot, offsetting by half its width/height to center it
            dot.style.left = `${x - dotSize / 2}px`;
            dot.style.top = `${y - dotSize / 2}px`;

            if (i % 5 === 0) { // Every 5th dot is an hour mark (0, 5, 10, ..., 55 minutes)
                dot.classList.add('hour-mark-dot');
                this.hourglassHourDots.push(dot); // Keep reference to hour marks
            } else {
                // Add minute-mark-dot class for non-hour dots
                dot.classList.add('minute-mark-dot');
            }
            
            this.hourglassMinuteDots.push(dot); // Keep reference to all 60 minute marks
            dotsContainer.appendChild(dot);
        }
    }

    updateHourglassDots(time) {
        // Ensure dots are initialized before updating their state
        if (this.hourglassMinuteDots.length === 0 && this.elements.hourglassDotsContainer && this.elements.hourglassDotsContainer.children.length > 0) {
            // If elements exist in DOM but our arrays are empty (e.g. page refresh), re-populate
            this.initHourglassDots();
        } else if (this.hourglassMinuteDots.length === 0) {
            // If no dots are in DOM and arrays are empty, do nothing until init is called on activation
            return;
        }

        // --- Activate Hour Dots ---
        // `time.hours % 12` gives 0-11 for the current hour (e.g., 1 PM is 1, 12 AM/PM is 0/12)
        const currentHourIndex = time.hours % 12;
        
        this.hourglassHourDots.forEach((dot, index) => {
            if (index === currentHourIndex) { // If it's the current hour index (0-11)
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // --- Activate Minute Dots ---
        // First, deactivate all minute dots from the previous second
        this.hourglassMinuteDots.forEach(dot => dot.classList.remove('active-minute'));

        // Then, activate the current minute dot
        const currentMinuteIndex = time.minutes; // 0-59
        if (this.hourglassMinuteDots[currentMinuteIndex]) {
            this.hourglassMinuteDots[currentMinuteIndex].classList.add('active-minute');
        }
    }
}
class FlipClock {
    static updateCard(id, newValue) {
        const card = document.getElementById(id);
        if (!card) return;

        const formattedValue = TimeUtils.formatTime(newValue);
        const currentValue = card.querySelector('.top .top-number')?.textContent;

        if (formattedValue === currentValue) return;

        // Set the 'next' value
        const nextTopNumbers = card.querySelectorAll('.next-top .top-number');
        nextTopNumbers.forEach(el => el.textContent = formattedValue);

        // Start the flip animation
        card.classList.add('flip');

        // After animation, update current value and remove flip class
        setTimeout(() => {
            const bottomNumbers = card.querySelectorAll('.bottom .bottom-number, .next-bottom .bottom-number');
            bottomNumbers.forEach(el => el.textContent = formattedValue);

            const topElement = card.querySelector('.top .top-number');
            if (topElement) topElement.textContent = formattedValue;

            card.classList.remove('flip');
        }, 600); // Matches animation duration
    }

    static update(time) {
        this.updateCard('flip-hours', time.hours);
        this.updateCard('flip-minutes', time.minutes);
        this.updateCard('flip-seconds', time.seconds);
    }
}

class ClockStyleManager {
    constructor() {
        this.styleSelector = document.getElementById('clockStyle');
        this.currentStyle = null;
        this.init();
    }

    init() {
        this.styleSelector?.addEventListener('change', (e) => {
            this.switchStyle(e.target.value);
        });

        // Set initial style based on dropdown or a default
        const selectedStyle = this.styleSelector?.value || 'digital';
        this.switchStyle(selectedStyle);
    }

    switchStyle(style) {
        // Deactivate all clocks
        document.querySelectorAll('.clock').forEach(clock => {
            clock.classList.remove('active');
        });

        // Activate the selected clock
        const targetClock = document.querySelector(`.${style}-clock`);
        if (targetClock) {
            targetClock.classList.add('active');
            this.currentStyle = style;

            // Ensure the select box also reflects the current style if it was changed programmatically
            if (this.styleSelector && this.styleSelector.value !== style) {
                this.styleSelector.value = style;
            }
        }
    }

    getCurrentStyle() {
        return this.currentStyle;
    }
}

class MultiStyleClock {
    constructor() {
        this.renderer = new ClockRenderer();
        this.styleManager = new ClockStyleManager();
        this.sandSystem = null;
        this.init();
    }

    init() {
        // Initial update to display current time immediately
        this.update();
        // Set interval for continuous updates every second
        setInterval(() => this.update(), 1000);

        // Listen for style changes from the manager to activate/deactivate sand system
        this.styleManager.styleSelector.addEventListener('change', () => {
            this.handleSandSystemActivation();
            // Important: Re-initialize dots if hourglass is just activated
            if (this.styleManager.getCurrentStyle() === 'hourglass') {
                 this.renderer.initHourglassDots(); // Initialize dots only once on activation
            }
        });

        // Initial check in case hourglass is the default style on page load
        if (this.styleManager.getCurrentStyle() === 'hourglass') {
            this.renderer.initHourglassDots();
        }
    }

    handleSandSystemActivation() {
        const currentStyle = this.styleManager.getCurrentStyle();
        if (currentStyle === 'hourglass') {
            if (!this.sandSystem) {
                const hourglassElement = document.querySelector('.hourglass');
                if (hourglassElement) {
                    this.sandSystem = new SandParticleSystem(hourglassElement);
                    this.sandSystem.start();
                }
            }
        } else {
            if (this.sandSystem) {
                this.sandSystem.stop();
                this.sandSystem = null;
            }
            // Clear hourglass specific elements when switching away
            const dotsContainer = document.getElementById('hourDots');
            if (dotsContainer) {
                dotsContainer.innerHTML = ''; // Clear dots when not hourglass
                // Also clear dot references in renderer
                this.renderer.hourglassHourDots = [];
                this.renderer.hourglassMinuteDots = [];
            }
        }
    }

    update() {
        const time = TimeUtils.getCurrentTime();

        this.renderer.updateDigital(time);
        this.renderer.updateAnalog(time);
        this.renderer.updateCircular(time);
        FlipClock.update(time);

        // Handle hourglass updates and sand particle system
        if (this.styleManager.getCurrentStyle() === 'hourglass') {
            this.updateHourglass(time);
            // Ensure sand system is active if hourglass is selected
            this.handleSandSystemActivation(); // This will ensure particles start if not already
        } else {
            // Ensure sand system is stopped if hourglass is not selected
            this.handleSandSystemActivation(); // This will stop particles if active
        }
    }

    updateHourglass(time) {
        const topSand = document.querySelector('.hourglass .top-sand');
        const bottomSand = document.querySelector('.hourglass .bottom-sand');

        if (!topSand || !bottomSand) return;

        // Calculate total seconds into the current hour
        const currentSecondsInHour = (time.minutes * 60) + time.seconds;
        const totalSecondsInHour = 3600; // 60 minutes * 60 seconds

        // Calculate percentage of the hour that has passed
        const percentageElapsed = currentSecondsInHour / totalSecondsInHour;

        // Top sand reduces height from 100% to 0% as time passes
        const percentTop = (1 - percentageElapsed) * 100;
        // Bottom sand increases height from 0% to 100% as time passes
        const percentBottom = percentageElapsed * 100;

        topSand.style.height = `${Math.max(0, percentTop)}%`; // Ensure it doesn't go below 0
        bottomSand.style.height = `${Math.min(100, percentBottom)}%`; // Ensure it doesn't go above 100

        // Update hour and minute dots based on the current time
        this.renderer.updateHourglassDots(time);
    }
}

// Initialize the clock system when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiStyleClock();
});