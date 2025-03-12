import { Consumable } from './playerConsumables.js';
import { physics } from './physics.js';
import { generalSplashes } from './splash.js';
import { ballHarming } from './player.js';
import { Splash } from './splash.js';


class Triangle {
    constructor(x, y, size, speed,  worldBounds, canvas, angle) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        
        this.worldBounds = worldBounds;
        this.canvas = canvas;
        this.angle = angle;
        this.dx = 0;
        this.dy = 0;
        this.xPhysics = 0;
        this.yPhysics = 0;
        this.hitCount = 0;
        this.color = 'SaddleBrown';
        this.splashes = [];
        this.rocks = [];
        
        this.sideLength = (2 / Math.sqrt(3)) * size;
    
        // Calculate the coordinates for an equilateral triangle
        this.topX = 0;
        this.topY = 0; // Top point
        this.bottomLeftX = -this.sideLength / 2;
        this.bottomLeftY = this.size; // Bottom-left point
        this.bottomRightX = this.sideLength / 2;
        this.bottomRightY = this.size;
    }

    draw(ctx, ball) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);
    
        
    
        // Draw the triangle
        ctx.beginPath();
        ctx.moveTo(this.topX, this.topY);
        ctx.lineTo(this.bottomLeftX, this.bottomLeftY);
        ctx.lineTo(this.bottomRightX, this.bottomRightY);
        ctx.closePath();
    
        ctx.fillStyle = this.color; // Set the fill color
        ctx.fill();
    
        ctx.restore();

        // Draw splashes if any
        this.splashes.forEach(splash => splash.draw(ctx));
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }

    update(ball, projectiles, consumables, platforms, endGame, triangles) {
        // Calculate direction towards the player
        this.angle = Math.atan2(ball.y - this.y - this.size/2, ball.x - this.x - this.size/2);
        
        // Use this angle to set the dx and dy to chase the player
        this.dx = this.speed * Math.cos(this.angle);
        this.dy = this.speed * Math.sin(this.angle);

        if (this.hitCount >= 30) {
            // Create a new consumable at the triangle's position
            const consumable = new Consumable(this.x, this.y, this.size, 'white', 'square');
            consumables.push(consumable);
            ball.score += this.size;

            // Remove this triangle from the game
            const index = triangles.indexOf(this);
            if (index > -1) {
                triangles.splice(index, 1);
            }

            // Return early since this triangle is now removed
            return;
        }

        // Move the triangle
        this.x += this.dx + this.xPhysics;
        this.y += this.dy + this.yPhysics;

        physics(this);
        
        
        platforms.forEach(platform => {
            // Check for collision with the platform using the triangle's vertices
            if (this.x + this.sideLength > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.size > platform.y &&
                this.y < platform.y + platform.height) {
                
                // Check collision with the top point of the triangle
                if (this.y + this.size / 2 > platform.y && this.y + this.size / 2 < platform.y + platform.height) {
                    this.y = platform.y - this.size / 2;
                    this.yPhysics = -Math.abs(this.dy);
                }
                // Check collision with the bottom-left point of the triangle
                else if (this.x + this.bottomLeftX > platform.x && this.x + this.bottomLeftX < platform.x + platform.width &&
                         this.y + this.bottomLeftY > platform.y && this.y + this.bottomLeftY < platform.y + platform.height) {
                    this.x = platform.x - this.bottomLeftX;
                    this.xPhysics = -Math.abs(this.dx);
                }
                // Check collision with the bottom-right point of the triangle
                else if (this.x + this.bottomRightX > platform.x && this.x + this.bottomRightX < platform.x + platform.width &&
                         this.y + this.bottomRightY > platform.y && this.y + this.bottomRightY < platform.y + platform.height) {
                    this.x = platform.x + platform.width - this.bottomRightX;
                    this.xPhysics = Math.abs(this.dx);
                }
            }
        });

        // Handle world bounds
        if (this.x < this.worldBounds.left) {
            this.x = this.worldBounds.left;
            this.xPhysics = Math.abs(this.dx);
        } else if (this.x + this.size > this.worldBounds.right) {
            this.x = this.worldBounds.right - this.size;
            this.xPhysics = -Math.abs(this.dx);
        }

        if (this.y < this.worldBounds.top) {
            this.y = this.worldBounds.top;
            this.yPhysics = Math.abs(this.dy);
        }
        else if (this.y + this.size > this.worldBounds.bottom) {
            this.yPhysics = -Math.abs(this.dy);
        }

        
        

        // Check for collision with the player
        if (Math.hypot(this.x + this.size / 2 - ball.x, this.y + this.size / 2 - ball.y) < this.size / 2 + ball.radius) {
            if (ball.dy * ball.radius > this.size * 8) {
                ball.score += this.size * 2;
                const consumable = new Consumable(this.x, this.y, this.size, 'white', 'square', this.xPhysics, this.yPhysics);
                consumables.push(consumable);
                const index = triangles.indexOf(this);
                generalSplashes.push(new Splash(this.x + this.size/2, this.y - this.size, this.size, 'lava', 'square'));
                triangles.splice(index, 1);
                return;
            } else {
                ballHarming(ball);
                this.splashes.push(new Splash(ball.x, ball.y, ball.radius, '255,255,255', 'circle'));
            }
        }

        // Update splashes
        this.splashes.forEach(splash => splash.update());
        this.splashes = this.splashes.filter(splash => !splash.isFinished());
    }

    

    reset() {
        this.x = this.canvas.width / 4;
        this.y = this.canvas.height / 4;
        this.size = 40;
        this.projectiles.length = 0;
        this.hitCount = 0;
        this.splashes = [];
    }
}

export function setupTriangles(canvas, ctx, ball, endGame, platforms, projectiles, consumables, worldBounds) {
    const triangles = [];

    function drawTriangles() {
        triangles.forEach(triangle => triangle.draw(ctx, ball));
    }

    function updateTriangles() {
        for (let i = triangles.length - 1; i >= 0; i--) {
            triangles[i].update(ball, projectiles, consumables, platforms, endGame, triangles);
        }
    }
   
    function spawntriangle() {
        if (triangles.length > 4) return;
        const x = Math.random() > 0.5 ? ball.x + 500 : ball.x - 500;
        const size = Math.random() * (canvas.height / 20) + (canvas.height / 10);
        const y = worldBounds.top - size;
        const speed = Math.random() * canvas.height / 700 + canvas.height / 700;
        
        const angle = Math.random() * Math.PI * 2;
        
        triangles.push(new Triangle(x, y, size, speed,  worldBounds, canvas, angle));
    }

    setInterval(spawntriangle, 4000);

    return {
        drawTriangles,
        updateTriangles,
        triangles
    };
}