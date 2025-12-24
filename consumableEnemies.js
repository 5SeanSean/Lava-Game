// filepath: /h:/Downloads/PLATZIO/playerConsumables.js
import { createLava } from "./lava.js";
import { physics } from "./physics.js";
export class Consumable {
    constructor(x, y, size, color, shape = 'square', xPhysics =0, yPhysics =0) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.shape = shape;
        this.speed = Math.random() *2+1;
        this.dx = 0;
        this.dy = 0;
        this.gravity = 0.1;
        this.splashed = false;
        this.yPhysics = yPhysics;
        this.xPhysics = xPhysics;
        this.speed = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 20;
        if (this.shape === 'square') {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        } else if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
        ctx.restore();
    }
    
update(nearbyPlatforms, worldBounds, canvas) {
    // Apply gravity
    this.dy += this.gravity;
    if (this.y > worldBounds.bottom - canvas.height/18) {
        this.dy -= this.gravity * 2;
    }
    
    // Check for collisions with nearby platforms only
    for (const platform of nearbyPlatforms) {
        if (this.x + this.size > platform.x &&
            this.x < platform.x + platform.width &&
            this.y + this.size > platform.y &&
            this.y < platform.y + platform.height) {
            
            // Collision from the top
            if (this.dy > 0 && this.y + this.size > platform.y && this.y < platform.y) {
                this.y = platform.y - this.size;
                this.dy = 0;
            }
            // Collision from the bottom
            else if (this.dy < 0 && this.y < platform.y + platform.height && this.y + this.size > platform.y + platform.height) {
                this.y = platform.y + platform.height;
                this.dy = 0;
            }
            // Collision from the left
            else if (this.dx > 0 && this.x + this.size > platform.x && this.x < platform.x) {
                this.x = platform.x - this.size;
                this.dx = 0;
            }
            // Collision from the right
            else if (this.dx < 0 && this.x < platform.x + platform.width && this.x + this.size > platform.x + platform.width) {
                this.x = platform.x + platform.width;
                this.dx = 0;
            }
        }
    }

    return false; // Indicate that the consumable should not be removed
}


    checkEnContact(squares) {
        let enConsumed = false;
        squares.forEach(square => {
            const dist = Math.hypot(this.x - square.x, this.y - square.y);
            if (dist < this.size)  {
                square.size+= this.size/3;
                square.x = square.x + square.size/2;
                square.y = square.y + square.size/2;
                enConsumed = true;
            }
                         
        });
    return enConsumed;
}

checkCollision(ball) {
    const dx = this.x + this.size/2 - ball.x;
    const dy = this.y + this.size/2 - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.size/2 + ball.radius;
}

}
export function drawConsumables(ctx, consumables) {
    consumables.forEach(consumable => consumable.draw(ctx));
}

export function updateConsumables(consumables, ball, projectiles, endGame, platforms, worldBounds, squares, canvas) {
    for (let i = consumables.length - 1; i >= 0; i--) {
        const consumable = consumables[i];
        const angle = Math.atan2(ball.y - consumable.y - consumable.size/2, ball.x - consumable.x - consumable.size/2);
        
        consumable.x += consumable.dx + consumable.xPhysics;
        if (consumable.speed > 0) {
            consumable.dy = (Math.sin(angle) * consumable.speed);
            consumable.dx = Math.cos(angle) * consumable.speed;
        }
        
        consumable.y += consumable.dy + consumable.yPhysics;
        
        // Check collision with projectiles
        for (let j = ball.projectiles.length - 1; j >= 0; j--) {
            const projectile = ball.projectiles[j];
            if (projectile.x + projectile.radius > consumable.x &&
                projectile.x - projectile.radius < consumable.x + consumable.size &&
                projectile.y + projectile.radius > consumable.y &&
                projectile.y - projectile.radius < consumable.y + consumable.size) {
                
                consumable.speed += projectile.radius/10;
                projectile.dx = -projectile.dx;
                projectile.dy = -projectile.dy;
            }
        }
        
        physics(consumable);
        
        // Get nearby platforms using spatial grid
        const nearbyPlatforms = platforms.getNearbyPlatforms?.(
            consumable.x, consumable.y, consumable.size, consumable.size
        ) || [];
        
        // Update consumable with only nearby platforms
        if (consumable.update(nearbyPlatforms, worldBounds, canvas) || 
            consumable.checkCollision(ball) || 
            consumable.checkEnContact(squares)) {
            
            if (consumable.checkCollision(ball)) {
                ball.score += consumable.size; 
                ball.radius += consumable.size/6;
            }
            
            consumables.splice(i, 1);
        }
    }
}