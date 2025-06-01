
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

class ClockRenderer {
    constructor() {
        this.elements = this.cacheElements();
    }

    cacheElements() {
        return {
            // Digital clock elements
            day: document.getElementById('day'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            
            // Analog clock elements
            analogHour: document.querySelector('.analog-clock .hour'),
            analogMinute: document.querySelector('.analog-clock .minute'),
            analogSecond: document.querySelector('.analog-clock .second'),
            
            // Circular clock elements
            circularHours: document.getElementById('circular-hours'),
            circularMinutes: document.getElementById('circular-minutes'),
            circularSeconds: document.getElementById('circular-seconds'),
            hourCircle: document.querySelector('.circular-clock .circle.hours svg circle:nth-child(2)'),
            minuteCircle: document.querySelector('.circular-clock .circle.minutes svg circle:nth-child(2)'),
            secondCircle: document.querySelector('.circular-clock .circle.seconds svg circle:nth-child(2)')
        };
    }

    updateDigital(time) {
        if (this.elements.day) this.elements.day.textContent = time.day;
        if (this.elements.hours) this.elements.hours.textContent = TimeUtils.formatTime(time.hours);
        if (this.elements.minutes) this.elements.minutes.textContent = TimeUtils.formatTime(time.minutes);
        if (this.elements.seconds) this.elements.seconds.textContent = TimeUtils.formatTime(time.seconds);
    }

    updateAnalog(time) {
        const secondDegrees = TimeUtils.calculateDegrees(time.seconds, 60);
        const minuteDegrees = TimeUtils.calculateDegrees(time.minutes + time.seconds / 60, 60);
        const hourDegrees = TimeUtils.calculateDegrees(time.hours + time.minutes / 60, 12);

        if (this.elements.analogSecond) {
            this.elements.analogSecond.style.transform = `rotate(${secondDegrees}deg)`;
        }
        if (this.elements.analogMinute) {
            this.elements.analogMinute.style.transform = `rotate(${minuteDegrees}deg)`;
        }
        if (this.elements.analogHour) {
            this.elements.analogHour.style.transform = `rotate(${hourDegrees}deg)`;
        }
    }

    updateCircular(time) {
        // Update text displays
        if (this.elements.circularHours) {
            this.elements.circularHours.textContent = TimeUtils.formatTime(time.hours);
        }
        if (this.elements.circularMinutes) {
            this.elements.circularMinutes.textContent = TimeUtils.formatTime(time.minutes);
        }
        if (this.elements.circularSeconds) {
            this.elements.circularSeconds.textContent = TimeUtils.formatTime(time.seconds);
        }

        // Update progress circles
        const hourProgress = TimeUtils.calculateProgress(time.hours % 12, 12);
        const minuteProgress = TimeUtils.calculateProgress(time.minutes, 60);
        const secondProgress = TimeUtils.calculateProgress(time.seconds, 60);

        if (this.elements.hourCircle) {
            this.elements.hourCircle.setAttribute('stroke-dasharray', `${hourProgress} 283`);
        }
        if (this.elements.minuteCircle) {
            this.elements.minuteCircle.setAttribute('stroke-dasharray', `${minuteProgress} 283`);
        }
        if (this.elements.secondCircle) {
            this.elements.secondCircle.setAttribute('stroke-dasharray', `${secondProgress} 283`);
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

        // Update next-top
        const nextTopElements = card.querySelectorAll('.next-top .top-number');
        nextTopElements.forEach(el => el.textContent = formattedValue);

        card.classList.add('flip');

        setTimeout(() => {
            // Update all bottom elements and current top
            card.querySelectorAll('.bottom .bottom-number, .next-bottom .bottom-number')
                .forEach(el => el.textContent = formattedValue);
            
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
        this.init();
    }

    init() {
        this.styleSelector?.addEventListener('change', (e) => {
            this.switchStyle(e.target.value);
        });
        
        // Get the currently selected value from dropdown
        const selectedStyle = this.styleSelector?.value || 'analog';
        this.switchStyle(selectedStyle); // Use selected style instead of default
    }

    switchStyle(style) {
        // Hide all clocks
        document.querySelectorAll('.clock').forEach(clock => {
            clock.classList.remove('active');
        });

        // Show selected clock
        const targetClock = document.querySelector(`.${style}-clock`);
        if (targetClock) {
            targetClock.classList.add('active');
            
            // Update dropdown to match if it doesn't already
            if (this.styleSelector && this.styleSelector.value !== style) {
                this.styleSelector.value = style;
            }
        }
    }
}

class MultiStyleClock {
    constructor() {
        this.renderer = new ClockRenderer();
        this.styleManager = new ClockStyleManager();
        this.init();
    }

    init() {
        this.update(); // Initial update
        setInterval(() => this.update(), 1000);
    }

    update() {
        const time = TimeUtils.getCurrentTime();
        
        // Update all clock styles
        this.renderer.updateDigital(time);
        this.renderer.updateAnalog(time);
        this.renderer.updateCircular(time);
        FlipClock.update(time);
    }
}

// Initialize the clock system
document.addEventListener('DOMContentLoaded', () => {
    new MultiStyleClock();
});
