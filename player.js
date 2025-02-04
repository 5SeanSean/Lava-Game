
export function setupPlayer(canvas, ctx, platforms, endGame, worldBounds) {
    const ball = {
        x: worldBounds.right/2,  
        y: canvas.height/16,
        radius: canvas.height/18,
        speed: canvas.height/270,
        dx: 0,
        dy: 0,
        gravity: canvas.height/10000,
        jumpPower: -canvas.height/100,
        isJumping: false,
        canDoubleJump: true,
        friction: canvas.height/1080,
        fireRate: 1000 / 6,//4 per second
        projSpeed: canvas.height/108,
        lastDashTime: 0,
        isGameRunning: false,
        
    };
    const pCamera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };
    
    function updatePCamera() {
        // Center the camera on the ball's x position
        pCamera.x = ball.x - pCamera.width / 2;
        pCamera.y = ball.y - pCamera.height / 2;
        // Clamp the camera position within the world bounds
        pCamera.x = Math.max(worldBounds.left, Math.min(pCamera.x, worldBounds.right - pCamera.width));
        pCamera.y = Math.max(worldBounds.top, Math.min(pCamera.y, worldBounds.bottom - pCamera.height));
        
    }
    function resetPlayer() {
        ball.isGameRunning = false;
        ball.x = worldBounds.right/2;
        ball.y = canvas.height/16;
        ball.dx = 0;
        ball.dy = 0;
        ball.isJumping = false;
        ball.canDoubleJump = true; // Reset double jump when game ends
        ball.radius= canvas.height/18;
        // Clear projectiles
       
        
    
        ball.lastDashTime= 0;
        
         // Set isGameRunning to false before starting the game

        // Pause the player for 0.5 seconds after resetting the player's position
        ball.w= false;
        ball.a= false;
        ball.d= false;
        ball.s= false;
    }

    const keys = {
        w: false,
        a: false,
        d: false,
        s: false
    };

    const projectiles= [];
    let isShooting = false;
    let lastShotTime = 0;
    const fireRate = ball.fireRate; 
    let mouseX = 0;
    let mouseY = 0;
    let mouseXAdjusted = 0;
    let mouseYAdjusted = 0;
    function drawBall() {
        // Save the current context state
        ctx.save();
        
        // Set up the glow effect
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 20;
        mouseXAdjusted = mouseX+ pCamera.x;
        mouseYAdjusted = mouseY+ pCamera.y;
        // Draw the stick pointing in the direction of the cursor
        const angle = Math.atan2(mouseYAdjusted - ball.y, mouseXAdjusted - ball.x);
        
        const stickLength = ball.radius * 1.7; // Length of the stick
        const stickEndX = ball.x + stickLength * Math.cos(angle);
        const stickEndY = ball.y + stickLength * Math.sin(angle);
    
        ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(stickEndX, stickEndY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = ball.radius / 4;
    ctx.stroke();
    ctx.closePath();
    
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = ball.radius / 7;
        ctx.stroke();
        ctx.closePath();
    
        // Draw the ball with glow
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    
        // Restore the context state (removes the glow effect for other drawings)
        ctx.restore();
    
       
        
    }

    function drawProjectiles() {
        ctx.fillStyle = 'white';
        projectiles.forEach(projectile => {
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        });
    }

    function updateBall() {
        
        
         
    
        updatePCamera();
        document.getElementById('scoreCounter').innerText = `Size: ${Math.round(ball.radius)-20 }`;
        if(ball.isGameRunning){
        ball.x += ball.dx;
        }
        ball.y += ball.dy;

        // Apply gravity
       
            ball.dy += ball.gravity;
        
        

        
        
        // Apply friction
        if (!keys.a && !keys.d) {
            ball.dx *= ball.friction;
        }
        
// Out of bounds
if (ball.x - ball.radius < worldBounds.left) {
    ball.x = worldBounds.left + ball.radius;
    ball.dx = 0;
}
 else if (ball.x + ball.radius > worldBounds.right) {
    ball.x = worldBounds.right - ball.radius;
    ball.dx = 0;
}

    //ceiling bounce
    if (ball.y - ball.radius < 0) {
        ball.y  = 0+ ball.radius;
        ball.dy = Math.abs(ball.dy) +ball.gravity;
        ball.isJumping = true;
    } 
    //bottom
    if (ball.y > worldBounds.bottom + ball.radius) {
        ball.y = worldBounds.bottom + ball.radius;
        ball.dx = 0;
        ball.isJumping = false;
        ball.canDoubleJump = true;
    }
        // Check for collisions with platforms
        platforms.forEach(platform => {
            // Get top, bottom, left, and right coordinates
            const top = platform.y;
            const bottom = platform.y + platform.height;
            const left = platform.x;
            const right = platform.x + platform.width;
    
            // Check for top collision
            if (ball.dy >= 0 && ball.y + ball.radius > top && ball.y < top && ball.x + ball.radius > left && ball.x - ball.radius< right) {
                
                if(ball.dy > 12){
                    
                    platform.yPhysics += (ball.dy); 
                    
                    platform.updated = true;
                     // Mark the platform as updated
                    
                    platform.hitPlatform();
                    if(!ball.isGameRunning){ball.isGameRunning = true;}
                    if(platform.hits <3){
                        ball.y = platform.y - ball.radius;
                        ball.dy = -ball.dy/5;
                        }
                        else{
                            ball.dy =ball.dy /2;
                            
                        }
                    }
                    else{
                        ball.dy = platform.dy;
                        
                    }
                    
                    
                        ball.y = top - ball.radius;
                        
                ball.canDoubleJump = true;
                ball.isJumping = false;

            //edges
            if (ball.x  < left&& ball.dx <= 0) {
                
                ball.y = -Math.sqrt(Math.pow(ball.radius, 2) - Math.pow(left - ball.x, 2)) + top;
                
            } else if (ball.x  > right && ball.dx >= 0) {
                ball.y = -Math.sqrt(Math.pow(ball.radius, 2) - Math.pow(ball.x- right, 2)) + top;

            }
        }
    
            // Check for bottom collision
            if ( ball.y - ball.radius < bottom && ball.y > bottom && ball.x + ball.radius > left && ball.x-ball.radius < right) {
                
                
                if(ball.dy < -3){
                    platform.yPhysics = ball.dy*1.6;
                    platform.updated = true;
                     
                    
                    platform.hitPlatform();
                    ball.canDoubleJump = false;
                    if(platform.hits <3){
                        ball.y = platform.y+platform.height + ball.radius;
                        ball.dy = -ball.dy/5;
                        }
                        else{
                            ball.dy = ball.dy/2;
                            
                        }
                    }
                    else{
                        ball.y = platform.y+platform.height + ball.radius+1;
                        ball.dy = Math.abs(ball.dy)/2;
                    }
                    
                        
                
                ball.isJumping = true;
            }
    
            // Check for left collision
            if (ball.dx > 0 && ball.x + ball.radius > left && ball.x < left && ball.y + ball.radius > top && ball.y < bottom && ball.dx > 0) {
                ball.x = left- ball.radius;
                
            }
    
            // Check for right collision
            if (ball.dx < 0 && ball.x - ball.radius < right && ball.x > right && ball.y + ball.radius > top && ball.y < bottom && ball.dx < 0) {
                ball.x = right+ ball.radius;
                
            }
        });
       
        if (ball.radius < canvas.height/40) {
            endGame();
            
        }
    }

    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
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
                        projectile.dy = -projectile.dy;
                        projectile.ricochetCount++;
                    }
                    // Collision from the left or right
                    if (projectile.x - projectile.radius < platform.x || projectile.x + projectile.radius > platform.x + platform.width) {
                        projectile.dx = -projectile.dx;
                        projectile.ricochetCount++;
                    }
                }
            });
    
            // Check for collision with the player
            if (Math.hypot(projectile.x - ball.x, projectile.y - ball.y) < projectile.radius + ball.radius && projectile.ricochetCount >=1) {
                if(projectile.radius>5){
                    ball.radius += projectile.radius/2;
                }
                else{
                    ball.radius += ball.radius/90;
                }
                
                projectiles.splice(i, 1); // Remove the projectile
                continue;
            }
    
            // Remove projectile if it goes out of bounds or ricochets more than 3 times
            if (projectile.x < ball.x-canvas.width/2 || projectile.x > ball.x+canvas.width/2 || projectile.y < 0 || projectile.y > worldBounds.bottom ) {
                
                projectiles.splice(i, 1);
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

    function moveBall(event) {
        
        switch (event.key) {
            case ' ':
            case 'w':
            case 'W':
            case 'ArrowUp':
                if (!ball.isJumping && ball.isGameRunning) {
                    ball.dy = ball.jumpPower;
                    ball.isJumping = true;
                    ball.canDoubleJump = true; // Allow double jump after first jump
                } else if (ball.canDoubleJump&& ball.isGameRunning) {
                    ball.dy = ball.jumpPower;
                    ball.canDoubleJump = false; // Disable double jump after using it
                }
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                keys.a = true;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                keys.d = true;
                break;
                
                case 's':
                case 'S':
                case 'ArrowDown':
                    if(ball.isGameRunning){keys.s = true;}
                    break;
        }
       
        updateBallDirection();
    
    }

    function stopBall(event) {
        switch (event.key) {
            case ' ':
            case 'w':
            case 'W':
            case 'ArrowUp':
                keys.w = false;
                break;
            case 'a':
            case'A':
            case 'ArrowLeft':
                keys.a = false;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                keys.d = false;
                break;
                
                case's':
                case'S':
                case 'ArrowDown': 
                keys.s = false;
                break;
        }
        updateBallDirection();
    }

    function updateBallDirection() {
        if (keys.a && keys.d) {
            ball.dx = 0;
        } else if (keys.a) {
            ball.dx = -ball.speed;
        } else if (keys.d) {
            ball.dx = ball.speed;
        }
        if(keys.s && (ball.dy > 1 || ball.dy < -1) && ball.lastDashTime < Date.now() - 500){
            ball.dx =0;
            ball.dy =  15;
            ball.isJumping = false;
            ball.lastDashTime = Date.now();
        }
    }

    function shootProjectile() {
    const angle = Math.atan2(mouseYAdjusted  - ball.y,mouseXAdjusted -  ball.x);
        const speed = ball.projSpeed;
        const dx = speed * Math.cos(angle);
        const dy = speed * Math.sin(angle);
        ball.radius-=ball.radius/90; // Reduce projectile size for smoother movement
        projectiles.push({
            x: ball.x,
            y: ball.y,
            radius: 5,
            dx: dx,
            dy: dy,
            ricochetCount: 0 // Initialize ricochet count
        });
    }

    function startShooting(event) {
        if (event.button === 0) { // Left mouse button
            const currentTime = Date.now();
            if (currentTime - lastShotTime >= fireRate) {
                isShooting = true;
                lastShotTime = currentTime;
                shootProjectile(event.clientX, event.clientY); // Call shootProjectile with current mouse position
            }
        }
        // Update mouse position
        mouseX = event.clientX ;
        mouseY = event.clientY ;
    }
    
    function stopShooting(event) {
        if (event.button === 0) { // Left mouse button
            isShooting = false;
        }
        // Update mouse position
        mouseX = event.clientX;
        mouseY = event.clientY ;
    }

    window.addEventListener('keydown', moveBall);
    window.addEventListener('keyup', stopBall);
    canvas.addEventListener('mousedown', startShooting);
    canvas.addEventListener('mouseup', stopShooting);
    canvas.addEventListener('mousemove', (event) => {
        mouseX = event.clientX ;
        mouseY = event.clientY ;
       
    });

    return {
        
        drawBall,
        
        updatePCamera,
        drawProjectiles,
        updateBall,
        updateProjectiles,
        handleShooting,
        resetPlayer,
        ball,
        projectiles
        
    };
   
}
export function ballHarming(ball){
    ball.radius = ball.radius/1.01;
}
