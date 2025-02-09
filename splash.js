// filepath: /h:/Downloads/PLATZIO/splash.js
import {textToRGB} from './tools.js';
import { getRandomLavaColor } from './lava.js';
export class Splash {
    constructor(x, y, radius, color, shape = 'circle') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color; // Expecting color in 'r, g, b' format
        this.shape = shape; // 'circle' or 'square'
        this.opacity = 1;
        this.growthRate = 0.5;
        this.fadeRate = 0.02;
        this.particles = [];

        for (let i = 0; i < 5; i++) {
            let particleColor = this.color;
            if (this.color === 'lava') {
                particleColor = getRandomLavaColor();
            }
            this.particles.push({
                x: x,
                y: y,
                radius: Math.random() * this.radius/5 + this.radius/10,
                dx: (Math.random() - 0.5) * this.radius/10,
                dy: (Math.random() - 0.5) * this.radius/10,
                opacity: 1,
                color: particleColor
            });
        }
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            const colorToUse = particle.color || this.color;
            ctx.fillStyle = `rgba(${textToRGB(colorToUse)}, ${particle.opacity})`;
            ctx.beginPath();
            if (this.shape === 'square') {
                ctx.rect(particle.x - particle.radius, particle.y - particle.radius, 
                         particle.radius * 2, particle.radius * 2);
            } else {
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            }
            ctx.fill();
        });
    }
    update() {
        this.particles.forEach(particle => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.dy += 0.05; // Gravity effect
            particle.opacity -= 0.02; // Fade out effect
        });

        // Remove particles that are no longer visible
        this.particles = this.particles.filter(particle => particle.opacity > 0);
        
    }

    isFinished() {
        return this.particles.length === 0;
    }
}
export const generalSplashes = [];
