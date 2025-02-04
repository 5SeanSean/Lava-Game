// filepath: /h:/Downloads/PLATZIO/playerConsumables.js
import { createLava } from "./lava.js";

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
        ctx.fillStyle = this.color;
        if (this.shape === 'square') {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        } else if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
        
    }
    
    update(platforms, worldBounds) {
        // Apply gravity
        


        
        
        
        

        // Check for collisions with platforms
        platforms.forEach(platform => {
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
        });

        return false; // Indicate that the consumable should not be removed
        
    }

    checkCollision(ball) {
        const distX = this.x + this.size / 2 - ball.x;
        const distY = this.y + this.size / 2 - ball.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        return distance < this.size / 2 + ball.radius;
    }

    checkEnContact(enemies) {
        let enConsumed = false;
        enemies.forEach(enemy => {
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (dist < this.size)  {
                enemy.size+= this.size/3;
                enemy.x = enemy.x + enemy.size/2;
                enemy.y = enemy.y + enemy.size/2;
                enConsumed = true;
            }
                         
        });
    return enConsumed;
}

}
export function drawConsumables(ctx, consumables) {
    consumables.forEach(consumable => consumable.draw(ctx));
}

export function updateConsumables(consumables, ball, projectiles, endGame, platforms, worldBounds, enemies, createLava) {
    for (let i = consumables.length - 1; i >= 0; i--) {

        
    
        
        const consumable = consumables[i];
        const angle = Math.atan2(ball.y - consumable.y- consumable.size/2, ball.x - consumable.x- consumable.size/2);
        
        
        
        consumable.x+= consumable.dx + consumable.xPhysics;
        if(consumable.speed > 0){
            consumable.dy = (Math.sin(angle) * consumable.speed);
            consumable.dx = Math.cos(angle) * consumable.speed;
        }
        else{
            consumable.dy += consumable.gravity;
            
        }
        consumable.y+= consumable.dy+ consumable.yPhysics;
        projectiles.forEach((projectile, projectileIndex) => {
            if (projectile.x + projectile.radius > consumable.x &&
                projectile.x - projectile.radius < consumable.x + consumable.size &&
                projectile.y + projectile.radius > consumable.y &&
                projectile.y - projectile.radius < consumable.y + consumable.size) {
                
                // Collision detected with projectile
                consumable.speed++;
                
               
            }
            
        });
        if(consumable.yPhysics != 0){
            consumable.yPhysics/=1.1;
        }
        if(Math.abs(consumable.yPhysics) <=0.3){
            consumable.yPhysics = 0;
        }
        if(consumable.xPhysics != 0){
            consumable.xPhysics/=1.1;
        }
        if(Math.abs(consumable.xPhysics) <=0.3){
            consumable.xPhysics = 0;
        }
        if (consumable.update(platforms, worldBounds) || consumable.checkCollision(ball)|| consumable.checkEnContact(enemies)) {
            if (consumable.checkCollision(ball)) {
                ball.radius += consumable.size/6; // Increase player's size
            }

            consumables.splice(i, 1); // Remove the consumable
        }
    }
}