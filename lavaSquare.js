import { ballHarming } from './player.js';
import { Splash } from './splash.js';
import { Consumable } from './playerConsumables.js';
import { getRandomLavaColor } from './lava.js';
import { physics } from './physics.js';
import { generalSplashes } from './splash.js';
import { textToRGB } from './tools.js';
import {winSizeConstant} from './main.js';

export class lavaSquare {
    constructor(x, y, size, speed, projectileSpeed, shootInterval, worldBounds, canvas, angle, health =20) {
        this.x = x;
        this.y = y;
        this.size = size;   
        this.speed = speed;
        this.dx = Math.cos(angle)*speed;
        this.dy = Math.sin(angle)*speed;
        this.projectileSpeed = projectileSpeed;
        this.shootInterval = shootInterval;
        this.lastShotTime = 0;
        this.hitCount = 0;
        this.health = health;
        this.color = 'red';
        this.projectiles = [];
        this.worldBounds = worldBounds; // Store world bounds
        this.canvas = canvas; // Store the canvas object
        this.lavaRectangles = this.generateLavaRectangles();
        this.splashes = []; // Store splashes
        this.stickColor = getRandomLavaColor();
        this.yPhysics =0;
        this.xPhysics = 0;
        this.angle = angle;
    }
    
    draw(ctx, ball) {
        // Draw the stick pointing in the direction of the player
        
        const stickLength = this.size; // Length of the stick
        const stickEndX = this.x + this.size / 2 + stickLength * Math.cos(this.angle);
        const stickEndY = this.y + this.size / 2 + stickLength * Math.sin(this.angle);
        const maxOpacity = 1; // Maximum opacity of the overlay
        const opacityPerHit = maxOpacity / this.health; 
        const currentOpacity = Math.min(this.hitCount * opacityPerHit, maxOpacity);
        this.splashes.forEach(splash => splash.draw(ctx));
        
        

        this.projectiles.forEach(projectile => {
            ctx.fillStyle = `rgba(${textToRGB('orange')}, 0.2)`;
        ctx.fillRect(
            projectile.x - projectile.radius*1.5, 
            projectile.y - projectile.radius*1.5, 
            projectile.radius * 3, 
            projectile.radius * 3
        );  
        ctx.fillStyle = `rgba(${textToRGB('magma')}, 0.5)`;
        ctx.fillRect(
            projectile.x - projectile.radius*1.25, 
            projectile.y - projectile.radius*1.25, 
            projectile.radius * 2.5, 
            projectile.radius * 2.5
        );  
            ctx.fillStyle = 'red';
        ctx.fillRect(
            projectile.x - projectile.radius*0.9, 
            projectile.y - projectile.radius*0.9, 
            projectile.radius * 1.8, 
            projectile.radius * 1.8
        );
        
        });
    
        ctx.beginPath();
        ctx.moveTo(this.x + this.size / 2, this.y + this.size / 2);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = this.stickColor;
        ctx.lineWidth = this.size/4;
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(this.x + this.size / 2, this.y + this.size / 2);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.lineWidth = this.size/4;
        ctx.stroke();
        ctx.closePath();
    
        // Draw the lavaSquare
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    
        // Draw lava rectangles
        ctx.save(); // Save the current context state
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.clip(); // Clip to the lavaSquare's rectangle
    
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
    
    update(ball, projectiles, consumables, platforms, endGame, lavaSquares) {
        // Calculate direction towards the player
        this.angle = Math.atan2(ball.y - this.y- this.size/2, ball.x - this.x- this.size/2);
        
        
        if (this.hitCount >= 30) {
            // Create a new consumable at the lavaSquare's position
            const consumable = new Consumable(this.x, this.y, this.size, 'white', 'square');
        consumables.push(consumable);
        ball.score+=this.size;
    
            // Remove this lavaSquare from the game
            const index = lavaSquares.indexOf(this);
            if (index > -1) {

                lavaSquares.splice(index, 1);
            }
    
            // Return early since this lavaSquare is now removed
            return;
        }
        // Move the lavaSquare
        this.x += this.dx + this.xPhysics;
        this.y += this.dy + this.yPhysics;

        physics(this);
        
        // Check for collisions with other lavaSquares
        lavaSquares.forEach(othersquare => {
            if (othersquare !== this) {
                const otherNextX = othersquare.x + othersquare.dx;
                const otherNextY = othersquare.y + othersquare.dy;
                const thisNextX = this.x + this.dx;
                const thisNextY = this.y + this.dy;
                if (thisNextX + this.size > otherNextX &&
                    thisNextX < otherNextX + othersquare.size &&
                    thisNextY + this.size > otherNextY &&
                    thisNextY < otherNextY + othersquare.size) {
                    
                    // other hitting from this bottom
                    if ((this.dy >0 || othersquare.dy < 0)&& thisNextY + this.size > otherNextY && thisNextY < otherNextY) {
                       
                        
                        this.dy = -Math.abs(this.dy);
                       othersquare.dy = Math.abs(othersquare.dy);
                    }
                    // other from this top
                     if ((this.dy <0 || othersquare.dy > 0) && thisNextY < otherNextY + othersquare.size && thisNextY > otherNextY) {
                        
                        
                        this.dy = Math.abs(this.dy);
                        othersquare.dy = -Math.abs(othersquare.dy);
                    }
                    // Collision from the left
                     if ((this.dx >0 || othersquare.dx < 0) && thisNextX + this.size > otherNextX && thisNextX < otherNextX) {
                        
                       
                        this.dx = Math.abs(this.dx);
                        othersquare.dx = -Math.abs(othersquare.dx);
                        
                    }
                    // Collision from the right
                     if ((this.dx <0 || othersquare.dx > 0)&& thisNextX < otherNextX + othersquare.size && thisNextX + this.size > otherNextX + othersquare.size) {
                        
                        
                        
                        this.dx = -Math.abs(this.dx);
                        othersquare.dx = Math.abs(othersquare.dx);
                    }
                }
                othersquare.projectiles.forEach((projectile, index) => {
                    if (projectile.x + projectile.radius > this.x &&
                        projectile.x - projectile.radius < this.x + this.size &&
                        projectile.y + projectile.radius > this.y &&
                        projectile.y - projectile.radius < this.y + this.size) {
                        
                        
            
                        
                        this.splashes.push(new Splash(projectile.x, projectile.y,this.size/3,'lava','lavaSquare'));
                        this.dx = projectile.dx;
                        this.dx = projectile.dy;
                        projectile.dx = -this.dx;
                        projectile.dy = -this.dy;
                        
                    }
                });
            }
        });

        // Check for collisions with projectiles
        ball.projectiles.forEach((projectile, index) => {
            if (projectile.x + projectile.radius > this.x &&
                projectile.x - projectile.radius < this.x + this.size &&
                projectile.y + projectile.radius > this.y &&
                projectile.y - projectile.radius < this.y + this.size) {
                
                // Remove the projectile
                ball.score+=0.1;
    
                // Increase the hit count
                this.hitCount+= winSizeConstant * projectile.radius/50;
                if(this.hitCount >= 30){
                    ball.score+=this.size;
                    ball.projectiles.splice(index, 1);
                }
                this.splashes.push(new Splash(projectile.x, projectile.y,this.size/3,'lava','lavaSquare'));
                this.xPhysics = projectile.dx/5;
                this.yPhysics = projectile.dy/5;
                // Reduce the lavaSquare size
                const halfSZ = this.size / 2;
                this.size *= 1.0001;
                this.dx = this.speed * Math.cos(this.angle);
                this.dy = this.speed * Math.sin(this.angle);
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
                
                if (this.dy <0 && this.y < platform.y + platform.height && this.y + this.size > platform.y + platform.height) {
                    this.y = platform.y +platform.height*1.1;
                        this.dy = Math.abs(this.dy);
                        if(platform.yPhysics>0){
                            this.yPhysics =  platform.yPhysics *1.1;
                            
                            this.hitCount+= this.yPhysics;
                            platform.yPhysics /= 1.01;
                            if(platform.hits >=3){
                                this.hitCount = 30;
                            }
                            
                        }
                    }
                else if ( this.dy >0 &&this.y + this.size > platform.y && this.y < platform.y) {
                    this.y = platform.y - this.size*1.1;
                    this.dy = -Math.abs(this.dy);
                }
                // Collision from the bottom
                
                // Collision from the left
                else if (this.dx > 0 && this.x + this.size > platform.x && this.x < platform.x) {
                    this.x = platform.x - this.size;
                    this.dx = -Math.abs(this.dx);
                }
                // Collision from the right
                else if (this.dx < 0 && this.x < platform.x + platform.width && this.x + this.size > platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                    this.dx = Math.abs(this.dx)
                }
            }
        });

        // Handle world bounds
        if (this.x < this.worldBounds.left) {
            this.x = this.worldBounds.left;
            this.dx =  Math.abs(this.dx);
        } else if (this.x + this.size > this.worldBounds.right) {
            this.x = this.worldBounds.right - this.size;
            this.dx = -Math.abs(this.dx);
        }

        if (this.y < this.worldBounds.top) {
            this.y = this.worldBounds.top;
            this.dy = Math.abs(this.dy);
        }
        else if (this.y + this.size > this.worldBounds.bottom) {
            this.dy = -Math.abs(this.dy);
        }

        // Shoot projectiles at intervals
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootInterval) {
            this.shootProjectile(ball);
            this.lastShotTime = currentTime;
        }

        // Update lavaSquare projectiles
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
                        this.splashes.push(new Splash(projectile.x, projectile.y,this.size/3,'lava','lavaSquare'));
                        this.projectiles.splice(i, 1);
                    }
                    // Collision from the left or right
                    if (projectile.x - projectile.radius < platform.x || projectile.x + projectile.radius > platform.x + platform.width) {
                        this.splashes.push(new Splash(projectile.x, projectile.y,this.size/3,'lava','lavaSquare'));
                        this.projectiles.splice(i, 1);
                    }
                }
            });

            

            // Check for collision with the player
            if (Math.hypot(projectile.x - ball.x, projectile.y - ball.y) < projectile.radius + ball.radius) {
                this.splashes.push(new Splash(projectile.x, projectile.y,projectile.radius*4,'255,255,255','circle'));
                ballHarming(ball);
               
                
                
                
            }
        }

        // Check for collision with the player
        if (Math.hypot(this.x + this.size / 2 - ball.x, this.y + this.size / 2 - ball.y) < this.size / 2 + ball.radius) {
            if(ball.dy*ball.radius>this.size*8){
                ball.score += this.size*2;
                const consumable = new Consumable(this.x, this.y, this.size, 'white', 'lavaSquare', this.xPhysics, this.yPhysics);
                consumables.push(consumable);
                const index = lavaSquares.indexOf(this);
                        generalSplashes.push(new Splash(this.x+this.size/2, this.y-this.size,this.size,'lava','square'));
                        lavaSquares.splice(index, 1);
                        
                    
                    return;
                }
                else{
                    ballHarming(ball);
                    this.splashes.push(new Splash(ball.x, ball.y,ball.radius,'255,255,255','circle'));
                    ball.dy = 0;
                    ball.dx = 0;
                    ball.yPhysics = (ball.y- (this.y+this.size/2) )/4;

                ball.xPhysics = (ball.x- (this.x+this.size/2) )/4;
                }
        }

        // Update splashes
        this.splashes.forEach(splash => splash.update());
        this.splashes = this.splashes.filter(splash => !splash.isFinished());
    }

    shootProjectile() {
        
        const speed = this.projectileSpeed;
        const dx = speed * Math.cos(this.angle);
        const dy = speed * Math.sin(this.angle);

        this.projectiles.push({
            x: this.x +this.size/2+ this.size  * Math.cos(this.angle),
            y: this.y +this.size/2 + this.size  * Math.sin(this.angle),
            radius: 5,
            dx: dx,
            dy: dy,
            shape: 'lavaSquare', // Set the shape to 'lavaSquare'
            color: getRandomLavaColor() // Initialize projectile color
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
        lavaSquares = [];
        this.x = this.canvas.width / 4;
        this.y = this.canvas.height / 4;
        this.size = 40; // Reset size
        this.projectiles.length = 0;
        this.hitCount = 0;
        this.lavaRectangles = this.generateLavaRectangles();
        this.splashes = []; // Reset splashes
    }
}

export function setupLavaSquares(canvas, ctx, ball, endGame, platforms, projectiles, consumables, worldBounds) {
    const lavaSquares = [];

    function drawLavaSquares() {
        lavaSquares.forEach(lavaSquare => lavaSquare.draw(ctx, ball));
    }

    function updateLavaSquares() {
        for (let i = lavaSquares.length - 1; i >= 0; i--) {
            lavaSquares[i].update(ball, projectiles, consumables, platforms, endGame, lavaSquares);
        }
    }
   
    function spawnLavaSquare() {
        if(lavaSquares.length > 20) return; // Limit the number of lavaSquares on the screen
        const x = Math.random()>0.5 ? ball.x+500 : ball.x-500; // Spawn within the visible width of the canvas centered on the player
        
        const size = Math.random()*(canvas.height/30)+(canvas.height/20);
        const y = worldBounds.bottom; // Spawn at the bottom of the world bounds
        const speed = Math.random()*canvas.height/700+canvas.height/700;
        const projectileSpeed = speed*1.1;
        const shootInterval = Math.random()*1000+4000;
        const angle = Math.random()*Math.PI*2;
        
        lavaSquares.push(new lavaSquare(x, y, size, speed, projectileSpeed, shootInterval, worldBounds, canvas, angle));
    }

    setInterval(spawnLavaSquare, 4000);

    return {
        drawLavaSquares,
        updateLavaSquares,
        lavaSquares
    };
}