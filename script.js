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
        this.NECK_Y_PERCENT = 49; // Y position of neck in % relative to hourglass height, slightly above 50%
        this.NECK_X_PERCENT = 50; // X position of neck in % relative to hourglass width
        this.PARTICLE_START_Y_OFFSET = 5; // Start particles slightly above the neck, within the top sand
        this.PARTICLE_MIN_DURATION = 1500; // ms - increased for longer flow
        this.PARTICLE_MAX_DURATION_ADDITION = 1000; // ms - increased
        this.PARTICLE_START_X_DRIFT_RANGE = 4; // %
        this.PARTICLE_END_X_DRIFT_RANGE = 10; // %
        this.CHAMBER_MIN_X_PERCENT = 15; // Inner-most x-coords of bottom chamber
        this.CHAMBER_MAX_X_PERCENT = 85; // Outer-most x-coords of bottom chamber
        this.BOTTOM_END_Y_PERCENT = 90; // Where particles settle in the bottom chamber

        // Adjust particle spawn rate for 1-hour duration.
        // We want a steady stream over an hour, so a particle every ~200ms is reasonable.
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
        const heightPercent = parseFloat(topSand.style.height);
        // Only allow particle creation if the top sand is not completely empty
        // Add a small threshold (e.g., 1%) to avoid particles when sand is at 0%
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
            if (particle.animationFrameId) {
                cancelAnimationFrame(particle.animationFrameId); // Ensure previous animations are stopped
            }
            particle.remove();
        });
        this.particles = []; // Clear array of particles
    }
}

class ClockRenderer {
    constructor() {
        this.elements = this.cacheElements();
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
            secondCircle: document.querySelector('.circular-clock .circle.seconds svg circle:nth-child(2)')
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

        // Circular clocks typically show progress within their own cycle (e.g., 60s for seconds)
        // For hours, use 12 to make it a 12-hour cycle visual.
        const hourProgress = TimeUtils.calculateProgress(time.hours % 12, 12);
        const minuteProgress = TimeUtils.calculateProgress(time.minutes, 60);
        const secondProgress = TimeUtils.calculateProgress(time.seconds, 60);

        if (hourCircle) hourCircle.setAttribute('stroke-dasharray', `${hourProgress} 283`);
        if (minuteCircle) minuteCircle.setAttribute('stroke-dasharray', `${minuteProgress} 283`);
        if (secondCircle) secondCircle.setAttribute('stroke-dasharray', `${secondProgress} 283`);
    }

    updateHourglassDots(time) {
        const dotsContainer = document.getElementById('hourDots');
        if (!dotsContainer) return;

        // Clear existing dots. It's better to clear and re-render or update existing.
        // For simplicity with variable number of dots, clearing is fine.
        if (dotsContainer.children.length === 0) { // Only re-create if empty
            for (let i = 0; i < 12; i++) { // 12 dots for 12 hours
                const dot = document.createElement('div');
                dot.classList.add('hour-dot');
                dotsContainer.appendChild(dot);
            }
        }
        const hourDots = Array.from(dotsContainer.children); // Get actual dot elements

        const currentHour = time.hours % 12; // 0-11 for array indexing
        hourDots.forEach((dot, index) => {
            if (index === currentHour) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

class FlipClock {
    static updateCard(id, newValue) {
        const card = document.getElementById(id);
        if (!card) return;

        const formattedValue = TimeUtils.formatTime(newValue);
        const currentValue = card.querySelector('.top .top-number')?.textContent;

        if (formattedValue === currentValue) return;

        const nextTopNumbers = card.querySelectorAll('.next-top .top-number');
        nextTopNumbers.forEach(el => el.textContent = formattedValue);

        card.classList.add('flip');

        setTimeout(() => {
            const bottomNumbers = card.querySelectorAll('.bottom .bottom-number, .next-bottom .bottom-number');
            bottomNumbers.forEach(el => el.textContent = formattedValue);

            const topElement = card.querySelector('.top .top-number');
            if (topElement) topElement.textContent = formattedValue;

            card.classList.remove('flip');
        }, 600);
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

        const selectedStyle = this.styleSelector?.value || 'analog';
        this.switchStyle(selectedStyle);
    }

    switchStyle(style) {
        document.querySelectorAll('.clock').forEach(clock => {
            clock.classList.remove('active');
        });

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
        // Initial update
        this.update();
        // Set interval for continuous updates
        setInterval(() => this.update(), 1000);

        // Listen for style changes from the manager to manage sand system activation/deactivation
        this.styleManager.styleSelector.addEventListener('change', () => {
            this.handleSandSystemActivation();
        });
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
            this.handleSandSystemActivation();
        } else {
            // Ensure sand system is stopped if hourglass is not selected
            this.handleSandSystemActivation();
        }
    }

    updateHourglass(time) {
        const topSand = document.querySelector('.hourglass .top-sand');
        const bottomSand = document.querySelector('.hourglass .bottom-sand');

        if (!topSand || !bottomSand) return;

        // Calculate total seconds into the current hour
        // (e.g., at 1:30:00, this is 30 * 60 = 1800 seconds)
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

        // Update hour dots based on the current hour
        this.renderer.updateHourglassDots(time);
    }
}

// Initialize the clock system when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiStyleClock();
});