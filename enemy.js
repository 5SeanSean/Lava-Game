import { ballHarming } from './player.js';
import { Splash } from './splash.js';
import { Consumable } from './playerConsumables.js';
import { getRandomLavaColor } from './lava.js';


export class Enemy {
    constructor(x, y, size, speed, projectileSpeed, shootInterval, worldBounds, canvas) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.dx = 0;
        this.dy = 0;
        this.projectileSpeed = projectileSpeed;
        this.shootInterval = shootInterval;
        this.lastShotTime = 0;
        this.hitCount = 0;
        this.color = 'red';
        this.projectiles = [];
        this.worldBounds = worldBounds; // Store world bounds
        this.canvas = canvas; // Store the canvas object
        this.lavaRectangles = this.generateLavaRectangles();
        this.splashes = []; // Store splashes
        this.stickColor = getRandomLavaColor();
        this.yPhysics =0;
        this.xPhysics = 0;
    }
    
    draw(ctx, ball) {
        // Draw the stick pointing in the direction of the player
        const angle = Math.atan2(ball.y - this.y- this.size/2, ball.x - this.x- this.size/2);
        const stickLength = this.size; // Length of the stick
        const stickEndX = this.x + this.size / 2 + stickLength * Math.cos(angle);
        const stickEndY = this.y + this.size / 2 + stickLength * Math.sin(angle);
        const maxOpacity = 1; // Maximum opacity of the overlay
        const opacityPerHit = maxOpacity / 30; 
        const currentOpacity = Math.min(this.hitCount * opacityPerHit, maxOpacity);
        this.splashes.forEach(splash => splash.draw(ctx));
        
        const glowSize = this.size*1.5; // Increase glow size for better visibility
    const glowOffset = (glowSize - this.size) / 2;

    const baseColor = [255, 0, 0]; 
    const hitFactor = this.hitCount / 30; // Assuming 4 hits is max
    const glowColor = baseColor.map(channel => Math.min(255, channel + (255 - channel) * hitFactor));

    // Create a radial gradient for the glow
    const gradient = ctx.createRadialGradient(
        this.x + this.size / 2, this.y + this.size / 2, 0,
        this.x + this.size / 2, this.y + this.size / 2, glowSize / 2
    );

    gradient.addColorStop(0, `rgba(${glowColor.join(',')}, 0.7)`);
    gradient.addColorStop(0.5, `rgba(${glowColor.join(',')}, 0.3)`);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    // Draw the tapering glow
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x - glowOffset, this.y - glowOffset, glowSize, glowSize);

        this.projectiles.forEach(projectile => {
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fillStyle = projectile.color;
            ctx.fill();
            ctx.closePath();
        });
    
        ctx.beginPath();
        ctx.moveTo(this.x + this.size / 2, this.y + this.size / 2);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = this.stickColor;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(this.x + this.size / 2, this.y + this.size / 2);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
    
        // Draw the enemy
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    
        // Draw lava rectangles
        ctx.save(); // Save the current context state
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.clip(); // Clip to the enemy's rectangle
    
        this.lavaRectangles.forEach(rect => {
            
        
        ctx.fillStyle = rect.color;
            ctx.fillRect(this.x + rect.x, this.y + rect.y, rect.width, rect.height);
        });
    
        ctx.restore(); // Restore the context state
        
    ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    }
    shrinkLavaRectangles() {
        const shrinkFactor = 1.0001; // Adjust this value to control how much the lava rectangles shrink
        this.lavaRectangles.forEach(rect => {
            rect.x *= shrinkFactor;
            rect.y *= shrinkFactor;
            rect.width *= shrinkFactor;
            rect.height *= shrinkFactor;
        });
    
        // Remove any rectangles that have become too small
        this.lavaRectangles = this.lavaRectangles.filter(rect => rect.width > 2 && rect.height > 2);
    
        // If all rectangles have been removed, generate a new small one
        if (this.lavaRectangles.length === 0) {
            this.lavaRectangles.push({
                x: Math.random() * this.size,
                y: Math.random() * this.size,
                width: Math.random() * (this.size / 4) + 2,
                height: Math.random() * (this.size / 4) + 2,
                color: getRandomLavaColor()
            });
            
    
        }
    }
    
    update(ball, projectiles, consumables, platforms, endGame, enemies) {
        // Calculate direction towards the player
        const angle = Math.atan2(ball.y - this.y- this.size/2, ball.x - this.x- this.size/2);
        this.dx = Math.cos(angle) * this.speed + this.xPhysics;
        
        this.dy = Math.sin(angle) * this.speed + this.yPhysics;
        
        if (this.hitCount >= 30) {
            // Create a new consumable at the enemy's position
            const consumable = new Consumable(this.x, this.y, this.size, 'white', 'square');
        consumables.push(consumable);
        
    
            // Remove this enemy from the game
            const index = enemies.indexOf(this);
            if (index > -1) {
                enemies.splice(index, 1);
            }
    
            // Return early since this enemy is now removed
            return;
        }
        // Move the enemy
        this.x += this.dx;
        this.y += this.dy + this.yPhysics;

        if(this.yPhysics != 0){
            this.yPhysics/=1.1;
        }
        if(Math.abs(this.yPhysics) <=0.3){
            this.yPhysics = 0;
        }
        if(this.xPhysics != 0){
            this.xPhysics/=1.1;
        }
        if(Math.abs(this.xPhysics) <=0.3){
            this.xPhysics = 0;
        }
        // Check for collisions with other enemies
        enemies.forEach(otherEnemy => {
            if (otherEnemy !== this) {
                const dist = Math.hypot(this.x - otherEnemy.x, this.y - otherEnemy.y);
                if (dist < this.size) {
                    // Adjust positions to prevent overlap
                    const overlap = this.size - dist;
                    const angle = Math.atan2(this.y - otherEnemy.y, this.x - otherEnemy.x);
                    this.x += Math.cos(angle) * overlap / 2;
                    this.y += Math.sin(angle) * overlap / 2;
                    otherEnemy.x -= Math.cos(angle) * overlap / 2;
                    otherEnemy.y -= Math.sin(angle) * overlap / 2;
                }
            }
        });

        // Check for collisions with projectiles
        projectiles.forEach((projectile, index) => {
            if (projectile.x + projectile.radius > this.x &&
                projectile.x - projectile.radius < this.x + this.size &&
                projectile.y + projectile.radius > this.y &&
                projectile.y - projectile.radius < this.y + this.size) {
                
                // Remove the projectile
            
    
                // Increase the hit count
                this.hitCount++;
                this.splashes.push(new Splash(projectile.x, projectile.y,this.size,'255,0,0','square'));
                this.xPhysics = projectile.dx/3;
                this.yPhysics = projectile.dy/3;
                // Reduce the enemy size
                const halfSZ = this.size / 2;
                this.size *= 1.0001;
                // Replace this line:
                // this.lavaRectangles = this.generateLavaRectangles();
                // With this:
                this.shrinkLavaRectangles();
                this.x += halfSZ - this.size / 2;
                this.y += halfSZ - this.size / 2;
    
                
                
            }
        });

        // Check for collisions with platforms
        platforms.forEach(platform => {
            if (this.x + this.size > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.size > platform.y &&
                this.y < platform.y + platform.height) {
                
                // Collision from the top
                if ( this.y + this.size > platform.y && this.y < platform.y) {
                    this.y = platform.y - this.size;
                    this.dy = 0;
                }
                // Collision from the bottom
                else if ( this.y < platform.y + platform.height && this.y + this.size > platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    if(platform.yPhysics>6){
                        this.y =  platform.y+platform.height;
                        
                        this.hitCount++;
                        platform.yPhysics /=2;
                        
                    }
                    this.yPhysics = (platform.yPhysics+platform.dy);
                    

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

        // Handle world bounds
        if (this.x < this.worldBounds.left) {
            this.x = this.worldBounds.left;
            this.dx = 0;
        } else if (this.x + this.size > this.worldBounds.right) {
            this.x = this.worldBounds.right - this.size;
            this.dx = 0;
        }

        if (this.y < this.worldBounds.top) {
            this.y = this.worldBounds.top;
            this.dy = 0;
        } else if (this.y + this.size > this.worldBounds.bottom) {
            this.y = this.worldBounds.bottom - this.size;
            this.dy = 0;
        }

        // Shoot projectiles at intervals
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootInterval) {
            this.shootProjectile(ball);
            this.lastShotTime = currentTime;
        }

        // Update enemy projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.x += projectile.dx;
            projectile.y += projectile.dy;

            // Check for collisions with platforms
            platforms.forEach(platform => {
                if (projectile.x + projectile.radius > platform.x &&
                    projectile.x - projectile.radius < platform.x + platform.width &&
                    projectile.y + projectile.radius > platform.y &&
                    projectile.y - projectile.radius < platform.y + platform.height) {
                    
                    // Collision from the top or bottom
                    if (projectile.y - projectile.radius < platform.y || projectile.y + projectile.radius > platform.y + platform.height) {
                        this.splashes.push(new Splash(projectile.x, projectile.y,this.size,'255,0,0','circle'));
                        this.projectiles.splice(i, 1);
                    }
                    // Collision from the left or right
                    if (projectile.x - projectile.radius < platform.x || projectile.x + projectile.radius > platform.x + platform.width) {
                        this.splashes.push(new Splash(projectile.x, projectile.y,this.size,'255,0,0','circle'));
                        this.projectiles.splice(i, 1);
                    }
                }
            });

            

            // Check for collision with the player
            if (Math.hypot(projectile.x - ball.x, projectile.y - ball.y) < projectile.radius + ball.radius) {
                this.splashes.push(new Splash(projectile.x, projectile.y,this.size,'255,255,255','circle'));
                ballHarming(ball);
                
                
                
            }
        }

        // Check for collision with the player
        if (Math.hypot(this.x + this.size / 2 - ball.x, this.y + this.size / 2 - ball.y) < this.size / 2 + ball.radius) {
            if(ball.dy>10){
                setTimeout(ball.dy/=2, 500);
                const consumable = new Consumable(this.x, this.y, this.size, 'white', 'square', this.xPhysics, this.yPhysics);
                consumables.push(consumable);
                const index = enemies.indexOf(this);
                    
                        enemies.splice(index, 1);
                    
                    
                    return;
                }
                else{
                    ballHarming(ball);
                }
        }

        // Update splashes
        this.splashes.forEach(splash => splash.update());
        this.splashes = this.splashes.filter(splash => !splash.isFinished());
    }

    shootProjectile(ball) {
        const angle = Math.atan2(ball.y - this.y - this.size/2, ball.x - this.x- this.size/2);
        const speed = this.projectileSpeed;
        const dx = speed * Math.cos(angle);
        const dy = speed * Math.sin(angle);

        this.projectiles.push({
            x: this.x + this.size / 2,
            y: this.y + this.size / 2,
            radius: 5,
            dx: dx,
            dy: dy,
            
            color: 'red' // Initialize projectile color
        });
    }

    generateLavaRectangles() {
        const rectangles = [];
        
        const count = 10; // 3 to 7 rectangles
    
        for (let i = 0; i < count; i++) {
            rectangles.push({
                x: Math.random() * this.size,
                y: Math.random() * this.size,
                width: Math.random() * (this.size)+4,
                height: Math.random() * (this.size / 4)+ (this.size / 10),
                color: getRandomLavaColor()
            });
        }
    
        return rectangles;
    }

   

    reset() {
        enemies = [];
        this.x = this.canvas.width / 4;
        this.y = this.canvas.height / 4;
        this.size = 40; // Reset size
        this.projectiles.length = 0;
        this.hitCount = 0;
        this.lavaRectangles = this.generateLavaRectangles();
        this.splashes = []; // Reset splashes
    }
}

export function setupEnemies(canvas, ctx, ball, endGame, platforms, projectiles, consumables, worldBounds) {
    const enemies = [];

    function drawEnemies() {
        enemies.forEach(enemy => enemy.draw(ctx, ball));
    }

    function updateEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].update(ball, projectiles, consumables, platforms, endGame, enemies);
        }
    }

    function spawnEnemy() {
        if(enemies.length > 4) return; // Limit the number of enemies on the screen
        const x = Math.random()>0.5 ? ball.x+500 : ball.x-500; // Spawn within the visible width of the canvas centered on the player
        const y = worldBounds.bottom; // Spawn at the bottom of the world bounds
        const size = Math.random()*30+40;
        const speed = Math.random()*0.5+0.5;
        const   peed = Math.random()*1+speed+1;
        const shootInterval = Math.random()*500+3000;
        enemies.push(new Enemy(x, y, size, speed, projectileSpeed, shootInterval, worldBounds, canvas));
    }

    setInterval(spawnEnemy, 4000);

    return {
        drawEnemies,
        updateEnemies,
        enemies
    };
}