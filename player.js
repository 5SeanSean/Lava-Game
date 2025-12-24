// filepath: /h:/Downloads/PLATZIO/player.js
import { physics } from './physics.js';
import { winSizeConstant } from './main.js';
import { GAME_CONFIG } from './config.js';

export let mouseXAdjusted = 0;
export let mouseYAdjusted = 0;

export function setupPlayer(canvas, ctx, platforms, endGame, worldBounds) {
    const ball = {
        x: worldBounds.right / 2,
        y: canvas.height / 16,
        radius: canvas.height / 18,
        speed: canvas.height / 270,
        dx: 0,
        dy: 0,
        gravity: canvas.height / 10000,
        jumpPower: -canvas.height / 100,
        isJumping: false,
        canDoubleJump: true,
        friction: canvas.height / 1080,
        fireRate: 200,
        projSpeed: canvas.height / 50,
        currentStock: 10,
        maxStock: 10,
        isGameRunning: false,
        projectiles: [],
        score: 0,
        xPhysics: 0,
        yPhysics: 0,
        angle: 0,
        strength: 1,
    };
    
    const pCamera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };
    
    function updatePCamera() {
        pCamera.x = ball.x - pCamera.width / 2;
        pCamera.y = ball.y - pCamera.height / 2;
        pCamera.x = Math.max(worldBounds.left, Math.min(pCamera.x, worldBounds.right - pCamera.width));
        pCamera.y = Math.max(worldBounds.top, Math.min(pCamera.y, worldBounds.bottom - pCamera.height));
    }
    
    function resetPlayer() {
        ball.isGameRunning = false;
        ball.x = worldBounds.right / 2;
        ball.y = canvas.height / 16;
        ball.dx = 0;
        ball.dy = 0;
        ball.currentStock = ball.maxStock;
        ball.isJumping = false;
        ball.canDoubleJump = true;
        ball.radius = canvas.height / 18;
        ball.score = 0;
        isShooting = false;
        keysPressed.clear();
    }
    
    // Optimized input handling
    const keysPressed = new Set();
    let isShooting = false;
    let lastShotTime = 0;
    const fireRate = ball.fireRate;
    let mouseX = 0;
    let mouseY = 0;
    
    // Input handling with debouncing
    function handleKeyDown(event) {
        const key = event.key.toLowerCase();
        keysPressed.add(key);
        
        // Handle jump (space, w, arrowup)
        if ((key === ' ' || key === 'w' || key === 'arrowup') && ball.isGameRunning) {
            if (!ball.isJumping) {
                ball.dy = ball.jumpPower * ball.strength;
                ball.isJumping = true;
                ball.canDoubleJump = true;
            } else if (ball.canDoubleJump) {
                ball.dy = ball.jumpPower * ball.strength;
                ball.canDoubleJump = false;
            }
            event.preventDefault(); // Prevent spacebar from scrolling
        }
    }
    
    function handleKeyUp(event) {
        const key = event.key.toLowerCase();
        keysPressed.delete(key);
    }
    
    // Mouse handling
    function handleMouseDown(event) {
        if (event.button === 0 && ball.isGameRunning) {
            isShooting = true;
            const currentTime = Date.now();
            if (currentTime - lastShotTime >= fireRate) {
                shootProjectile();
                lastShotTime = currentTime;
            }
        }
        updateMousePosition(event);
    }
    
    function handleMouseUp(event) {
        if (event.button === 0) {
            isShooting = false;
        }
        updateMousePosition(event);
    }
    
    function handleMouseMove(event) {
        updateMousePosition(event);
    }
    
    function updateMousePosition(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
    
    // Update ball direction based on keys
    function updateBallDirection() {
        const hasA = keysPressed.has('a') || keysPressed.has('arrowleft');
        const hasD = keysPressed.has('d') || keysPressed.has('arrowright');
        const hasS = keysPressed.has('s') || keysPressed.has('arrowdown');
        
        if (hasA && hasD) {
            ball.dx = 0;
        } else if (hasA) {
            ball.dx = -ball.speed;
        } else if (hasD) {
            ball.dx = ball.speed;
        } else {
            ball.dx *= ball.friction;
        }
        
        if (hasS && ball.isGameRunning && ball.dy < 15) {
            ball.dy += 0.5 * ball.strength;
            ball.isJumping = false;
        }
    }
    
    // Draw functions (optimized)
    function drawBall() {
        ctx.save();
        
        // Set up glow effect
        ctx.shadowColor = 'white';
        ctx.shadowBlur = ball.radius / 2;
        
        mouseXAdjusted = mouseX + pCamera.x;
        mouseYAdjusted = mouseY + pCamera.y;
        
        // Draw stick pointing at cursor
        const stickLength = (ball.radius) * (ball.currentStock / ball.maxStock) + ball.radius;
        const stickEndX = ball.x + stickLength * Math.cos(ball.angle);
        const stickEndY = ball.y + stickLength * Math.sin(ball.angle);
        
        // Draw stick shadow
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = ball.radius / 2;
        ctx.stroke();
        
        // Draw stick
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = ball.radius / 3;
        ctx.stroke();
        
        // Draw motion blur effects
        ctx.beginPath();
        ctx.arc(ball.x - ball.dx / 2, ball.y - ball.dy / 2, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(ball.x - ball.dx, ball.y - ball.dy, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        
        // Draw main ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        ctx.restore();
    }
    
    function drawProjectiles() {
        ctx.save();
        ctx.shadowColor = 'white';
        
        ball.projectiles.forEach(projectile => {
            ctx.shadowBlur = projectile.radius / 2;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    function updateBall() {
        ball.angle = Math.atan2(mouseYAdjusted - ball.y, mouseXAdjusted - ball.x);
        updatePCamera();
        
        document.getElementById('scoreCounter').innerText = `Score: ${Math.round(ball.score * winSizeConstant)}`;
        
        updateBallDirection();
        
        ball.x += ball.dx * (0.2 + ball.strength * 0.8) + ball.xPhysics;
        ball.y += ball.dy + ball.yPhysics;
        
        physics(ball);
        
        // Apply gravity
        ball.dy += ball.gravity;
        
        // Boundary checks
        if (ball.x - ball.radius < worldBounds.left) {
            ball.x = worldBounds.left + ball.radius;
            ball.dx = -ball.dx / 1.5;
        } else if (ball.x + ball.radius > worldBounds.right) {
            ball.x = worldBounds.right - ball.radius;
            ball.dx = -ball.dx / 1.5;
        }
        
        if (ball.y - ball.radius < 0) {
            ball.y = 0 + ball.radius;
            ball.dy = Math.abs(ball.dy) + ball.gravity;
            ball.isJumping = true;
        }
        
        if (ball.y > worldBounds.bottom + ball.radius) {
            ball.y = worldBounds.bottom + ball.radius;
            ball.dx = 0;
            ball.isJumping = false;
            ball.canDoubleJump = true;
        }
        
        // Game over conditions
        if (ball.radius < canvas.height / 40) {
            endGame();
        }
        
        // Recover strength
        if (ball.strength < 1) {
            ball.strength += 0.05;
        }
        
        if (ball.strength < 0) {
            ball.strength = 0;
        }
    }
    
    // Projectile functions
    function updateProjectiles() {
        for (let i = ball.projectiles.length - 1; i >= 0; i--) {
            const projectile = ball.projectiles[i];
            
            projectile.x += projectile.dx;
            projectile.y += projectile.dy;
            projectile.dy += 0.05;
            
            // Check platform collisions
            let collided = false;
            for (const platform of platforms) {
                if (projectile.x + projectile.radius > platform.x &&
                    projectile.x - projectile.radius < platform.x + platform.width &&
                    projectile.y + projectile.radius > platform.y &&
                    projectile.y - projectile.radius < platform.y + platform.height) {
                    
                    if (projectile.y - projectile.radius < platform.y || 
                        projectile.y + projectile.radius > platform.y + platform.height) {
                        projectile.dy = -projectile.dy;
                        projectile.ricochetCount++;
                    }
                    
                    if (projectile.x - projectile.radius < platform.x || 
                        projectile.x + projectile.radius > platform.x + platform.width) {
                        projectile.dx = -projectile.dx;
                        projectile.ricochetCount++;
                    }
                    
                    collided = true;
                    break;
                }
            }
            
            // Check player collision
            if (!collided && Math.hypot(projectile.x - ball.x, projectile.y - ball.y) < 
                projectile.radius + ball.radius && projectile.ricochetCount >= 1) {
                ball.radius += ball.radius / 1000;
                ball.projectiles.splice(i, 1);
                continue;
            }
            
            // Remove out of bounds projectiles
            if (projectile.x < ball.x - canvas.width || 
                projectile.x > ball.x + canvas.width || 
                projectile.y < 0 || 
                projectile.y > worldBounds.bottom || 
                projectile.ricochetCount >= 3) {
                ball.projectiles.splice(i, 1);
            }
        }
    }
    
    function handleShooting() {
        if (isShooting) {
            const currentTime = Date.now();
            if (currentTime - lastShotTime >= fireRate) {
                shootProjectile();
                lastShotTime = currentTime;
            }
        }
    }
    
    function shootProjectile() {
        if (ball.currentStock <= 0) {
            reload();
            return;
        }
        
        ball.currentStock--;
        const speed = ball.projSpeed;
        const dx = speed * Math.cos(ball.angle);
        const dy = speed * Math.sin(ball.angle);
        ball.radius -= ball.radius / 1000;
        
        ball.projectiles.push({
            x: ball.x + (ball.radius * 1.7 * Math.cos(ball.angle)) / 2,
            y: ball.y + (ball.radius * 1.7 * Math.sin(ball.angle)) / 2,
            radius: ball.radius / 6,
            dx: dx,
            dy: dy,
            ricochetCount: 0,
        });
    }
    
    function reload() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => ball.radius *= 1.02, 30 * i);
        }
        
        reloadHelper();
        for (let i = 0; i < ball.maxStock - 1; i++) {
            setTimeout(reloadHelper, 10 * i);
        }
    }
    
    function reloadHelper() {
        ball.currentStock++;
        ball.radius /= 1.02;
    }
    
    // Event listeners with passive option for better performance
   window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    canvas.addEventListener('mousedown', handleMouseDown, { passive: true });
    canvas.addEventListener('mouseup', handleMouseUp, { passive: true });
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return {
        drawBall,
        drawProjectiles,
        updateBall,
        updateProjectiles,
        handleShooting,
        resetPlayer,
        ball,
        mouseXAdjusted,
        mouseYAdjusted,
    };
}

export function ballHarming(ball) {
    ball.radius = ball.radius / 1.01;
}