
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
            }

            start() {
                if (this.isActive) return;
                this.isActive = true;
                
                // Create particles every 100ms when sand is falling
                this.particleInterval = setInterval(() => {
                    if (this.shouldCreateParticle()) {
                        this.createParticle();
                    }
                }, 100);
            }

            stop() {
                this.isActive = false;
                if (this.particleInterval) {
                    clearInterval(this.particleInterval);
                    this.particleInterval = null;
                }
            }

            shouldCreateParticle() {
                // Only create particles if there's sand in the top chamber
                const topSand = this.hourglass.querySelector('.top-sand');
                if (!topSand) return false;
                
                const height = parseFloat(topSand.style.height) || 100;
                return height > 0;
            }

            createParticle() {
                const particle = document.createElement('div');
                particle.className = 'sand-particle';
                
                // Start position: center of the neck
                const neckCenterX = 50; // 50% of hourglass width
                const neckY = 108; // Position of neck in hourglass
                
                // Add some randomness to starting position
                const startX = neckCenterX + (Math.random() - 0.5) * 8;
                
                particle.style.left = startX + '%';
                particle.style.top = neckY + 'px';
                
                this.hourglass.appendChild(particle);
                this.animateParticle(particle);
            }

            animateParticle(particle) {
                const startTime = Date.now();
                const duration = 800 + Math.random() * 400; // 800-1200ms fall time
                const startY = 108;
                const endY = 200; // Bottom of hourglass
                
                // Add slight horizontal drift
                const startX = parseFloat(particle.style.left);
                const drift = (Math.random() - 0.5) * 10;
                const endX = Math.max(25, Math.min(75, startX + drift)); // Keep within chamber bounds
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function for gravity effect
                    const easeProgress = progress * progress;
                    
                    const currentY = startY + (endY - startY) * easeProgress;
                    const currentX = startX + (endX - startX) * progress;
                    
                    particle.style.top = currentY + 'px';
                    particle.style.left = currentX + '%';
                    
                    // Fade out as it reaches the bottom
                    if (progress > 0.8) {
                        particle.style.opacity = 1 - ((progress - 0.8) / 0.2);
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Remove particle when animation is complete
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }
                };
                
                requestAnimationFrame(animate);
            }

            cleanup() {
                // Remove any remaining particles
                const particles = this.hourglass.querySelectorAll('.sand-particle');
                particles.forEach(particle => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                });
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
    updateHourglass(time) {
    const dotsContainer = document.getElementById('hourDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    const hour = time.hours % 12 || 12;

    for (let i = 1; i <= 12; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i <= hour) {
            dot.classList.add('active');
        }
        dotsContainer.appendChild(dot);
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
        this.currentStyle = null;
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
        this.lastHour = null;
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
        this.updateHourglass(time);
        // Handle sand particle system for hourglass
                if (this.styleManager.getCurrentStyle() === 'hourglass') {
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
                        this.sandSystem.cleanup();
                        this.sandSystem = null;
                    }
                }
            
    }

   updateHourglass(time) {
                const topSand = document.querySelector('.hourglass .top-sand');
                const bottomSand = document.querySelector('.hourglass .bottom-sand');
                const dotsContainer = document.getElementById('hourDots');
                if (!topSand || !bottomSand || !dotsContainer) return;
                
                // Calculate how many seconds have passed since the top of the current hour:
                const elapsedSeconds = time.minutes * 60 + time.seconds;
                const totalHourSecs = 60 * 60; // 3600 seconds per hour
                
                // Determine percentage of sand remaining in top chamber (100% → 0% over one hour)
                const percentTop = Math.max(0, (1 - (elapsedSeconds / totalHourSecs))) * 100;
                const percentBottom = Math.min(100, (elapsedSeconds / totalHourSecs)) * 100;
                
                // Smoothly transition heights once per second
                topSand.style.height = `${percentTop}%`;
                bottomSand.style.height = `${percentBottom}%`;
                
                // If we've rolled into a new hour, add a new dot
                if (this.lastHour === null) {
                    this.lastHour = time.hours;
                    // First launch of page: populate one dot if hour > 0
                    const initialCount = time.hours % 12 || 12;
                    for (let i = 1; i <= initialCount; i++) {
                        const dot = document.createElement('div');
                        dot.className = 'hour-dot';
                        dotsContainer.appendChild(dot);
                    }
                } else if (this.lastHour !== time.hours) {
                    this.lastHour = time.hours;
                    const dot = document.createElement('div');
                    dot.className = 'hour-dot';
                    dotsContainer.appendChild(dot);
                }
            }
        }

// Initialize the clock system
document.addEventListener('DOMContentLoaded', () => {
    new MultiStyleClock();
});
