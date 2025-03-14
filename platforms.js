import { createLava } from './lava.js';
import { Splash } from './splash.js';
import { worldBounds } from './view.js';
import { physics } from './physics.js';
import { ballHarming } from './player.js';
const genPlatSplashes = [];
function destorySplashes(platform, tOrB) {
    for (let i = 0; i < 3; i++) {
        const splash = new Splash(
            platform.x + Math.random() * platform.width,
            platform.y + tOrB * platform.height,
            platform.width*platform.height / 300,
            'grey',
            'square',
            Math.random() * platform.width /5,
            platform.yPhysics * 3,
            platform.width / 30
        );
        genPlatSplashes.push(splash);
        console.log("broke");
    }
    
                
    for (let i = 0; i < 3; i++) {
        const splash = new Splash(
            platform.x + Math.random() * platform.width,
            platform.y + tOrB * platform.height,
            platform.width*platform.height / 300,
            'grey',
            'square',
            Math.random() * -platform.width/5 ,
            platform.yPhysics * 3,
            platform.width / 30
        );
        genPlatSplashes.push(splash);
    }
}
class Platform {
    constructor(x, y, width, height, dx, dy, xPhysics, yPhysics, canvas) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.dy = dy;
        this.xPhysics = xPhysics;
        this.yPhysics = yPhysics;
        this.hits = 0;
        this.color = '#354859';
        this.hitRectangles = [];
        this.harmssquares = false;
        this.size = width * height;
        this.toRemove = false;
        this.canvas = canvas;
        this.splashes = [];
    }
    generateSplashes( tOrB) {
        for (let i = 0; i < 5; i++) {
            const splash = new Splash(
                this.x + Math.random() * this.width,
                this.y + tOrB * this.height,
                this.width *this.height/ 300,
                this.color,
                'square',
                Math.random() * this.width / 10 - this.width / 20,
                this.yPhysics * 3,
                this.width / 30
            );
            this.splashes.push(splash);
        }
    }
    hitPlatform(tOrB = 1) {
        this.hits++;
        this.harmssquares = true;
        setTimeout(() => {
            this.harmssquares = false;
        }, 1);
        if (this.hits === 1) {
            this.generateHitRectangles(0.5);
            this.generateSplashes( tOrB);
        } else if (this.hits === 2) {
            this.hitRectangles = [];
            this.color = 'grey';
            this.generateSplashes(tOrB);
        } else if (this.hits >= 3) {
            this.toRemove = true;
            this.generateSplashes( tOrB);
        }
    }

    generateHitRectangles(percentage) {
        const totalArea = this.width * this.height;
        const areaToFill = totalArea * percentage;
        let filledArea = 0;

        this.hitRectangles = [];
        while (filledArea < areaToFill) {
            const rectWidth = Math.random() * (this.width / 4) + 5;
            const rectHeight = Math.random() * (this.height / 2) + 5;
            const rectX = Math.random() * (this.width - rectWidth);
            const rectY = Math.random() * (this.height - rectHeight);

            this.hitRectangles.push({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });
            filledArea += rectWidth * rectHeight;
        }
    }

    
}

export function setupPlatforms(canvas, worldBounds) {
    const maxPlatDY = (canvas.height / 1000);
    const platforms = [];
    

    function newPlatform() {
        platforms.push(new Platform(
            Math.random() * (worldBounds.right),
            -30,
            Math.random() * (worldBounds.right / 25) + (worldBounds.right / 40),
            Math.random() * (worldBounds.bottom / 170) + (worldBounds.bottom / 90),
            0,
            Math.random() * (canvas.height / 3000) + (canvas.height / 2000),
            0,
            0,
            canvas
        ));
    }

    function genSidePlatX() {
        let sideX;
        if (Math.random() > 0.5) {
            sideX = Math.random() * ((worldBounds.right / 2) - ((worldBounds.right / 25) + (worldBounds.right / 40)) * 2);
        } else {
            sideX = Math.random() * ((worldBounds.right / 2) - ((worldBounds.right / 25) + (worldBounds.right / 40))) + (worldBounds.right / 25) + (worldBounds.right / 40) + (worldBounds.right / 2);
        }
        return sideX;
    }

    function startPlatforms() {
        platforms.push(new Platform(
            genSidePlatX(),
            Math.random() * (worldBounds.bottom - 100),
            Math.random() * (worldBounds.right / 25) + (worldBounds.right / 40),
            Math.random() * (worldBounds.bottom / 170) + (worldBounds.bottom / 90),
            0,
            Math.random() * (maxPlatDY - canvas.height / 2000) + (canvas.height / 2000),
            0,
            0,
            canvas
        ));
    }

    function generatePlatforms() {
        platforms.length = 0;
        const platformCount = 60;

        for (let i = 0; i < platformCount; i++) {
            startPlatforms();
        }

        platforms.push(new Platform(
            worldBounds.right / 2 - (worldBounds.right / 120),
            worldBounds.bottom / 1.6,
            (worldBounds.right / 60),
            (worldBounds.bottom / 30),
            0,
            Math.random() * (canvas.height / 3000) + (canvas.height / 2000),
            0,
            0,
            canvas
        ));
    }

    function drawPlatforms(ctx) {
        
        if(genPlatSplashes.length > 0){genPlatSplashes.forEach(splash => {
            ctx.fillStyle = splash.color;
            splash.draw(ctx);
        })}
        
        platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            ctx.fillStyle = 'grey';
            ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 2);

            if (platform.hitRectangles.length > 0) {
                ctx.fillStyle = 'grey';
                platform.hitRectangles.forEach(rect => {
                    ctx.fillRect(platform.x + rect.x, platform.y + rect.y, rect.width, rect.height);
                });
            }
            platform.splashes.forEach(splash => splash.draw(ctx));
        });
        
    }

    function updatePlatforms(ball) {
        for (let i = genPlatSplashes.length - 1; i >= 0; i--) {
            genPlatSplashes[i].update();
            if (genPlatSplashes[i].isFinished()) {
                genPlatSplashes.splice(i, 1);
            }
        }
        for (let i = platforms.length - 1; i >= 0; i--) {
            platforms[i].size = platforms[i].height * platforms[i].width;
            platforms[i].y += (platforms[i].dy + platforms[i].yPhysics);
            platforms[i].x += (platforms[i].dx + platforms[i].xPhysics);

            platforms.forEach(otherPlatform => {
                if (otherPlatform !== platforms[i]) {
                    let iLeft = platforms[i].x;
                    let iRight = platforms[i].x + platforms[i].width;
                    let jLeft = otherPlatform.x;
                    let jRight = otherPlatform.x + otherPlatform.width;

                    if (platforms[i].y + platforms[i].height > otherPlatform.y && platforms[i].y < otherPlatform.y && ((iLeft > jLeft && iLeft < jRight) || (iRight > jLeft && iRight < jRight))) {
                        otherPlatform.y = platforms[i].y + platforms[i].height;
                        let newDY = (platforms[i].dy + otherPlatform.dy) / 2;
                        platforms[i].dy = newDY;
                        otherPlatform.dy = newDY;
                        let newPhysics = (platforms[i].yPhysics + otherPlatform.yPhysics) / 2;
                        platforms[i].yPhysics = newPhysics;
                        otherPlatform.yPhysics = newPhysics;
                    } else if (otherPlatform.y + otherPlatform.height > platforms[i].y && otherPlatform.y < platforms[i].y && ((iLeft > jLeft && iLeft < jRight) || (iRight > jLeft && iRight < jRight))) {
                        platforms[i].y = otherPlatform.y + otherPlatform.height;
                        let newDY = (platforms[i].dy + otherPlatform.dy) / 2;
                        platforms[i].dy = newDY;
                        otherPlatform.dy = newDY;
                        let newPhysics = (platforms[i].yPhysics + otherPlatform.yPhysics) / 2;
                        platforms[i].yPhysics = newPhysics;
                        otherPlatform.yPhysics = newPhysics;
                    }
                }
            });

            physics(platforms[i]);

            if (platforms[i].y > worldBounds.bottom) {
                newPlatform();
                platforms[i].toRemove = true;
            }
            if (platforms[i].toRemove) {
                platforms.splice(i, 1);
            }

            let platform = platforms[i];

            for (let i = platform.splashes.length - 1; i >= 0; i--) {
                platform.splashes[i].update();
                if (platform.splashes[i].isFinished()) {
                    platform.splashes.splice(i, 1);
                }
            }

            const top = platform.y;
            const bottom = platform.y + platform.height;
            const left = platform.x;
            const right = platform.x + platform.width;
            //left
            if (ball.x + ball.radius > left && ball.x < left && ball.y + ball.radius > top && ball.y - ball.radius < bottom && ball.dx >= 0 && (ball.y + ball.radius > bottom + ball.radius / 20 || ball.radius < platform.height)) {
                platform.xPhysics = ball.dx / 1.5;
                ball.strength -= 0.5;
            }
            //right
            if (ball.x - ball.radius < right && ball.x > right && ball.y + ball.radius > top && ball.y - ball.radius < bottom && ball.dx <= 0 && (ball.y + ball.radius > bottom + ball.radius / 20 || ball.radius < platform.height)) {
                platform.xPhysics = ball.dx / 1.5;
                ball.strength -= 0.5;
            }
            //top
            if (ball.y + ball.radius > top && ball.y < top) {
                if (ball.x + ball.radius >= left && ball.x - ball.radius <= right) {
                    if (right < ball.x) {
                        ball.y = top - Math.sqrt(Math.max(0, ball.radius ** 2 - (right - ball.x) ** 2));
                        ball.xPhysics += (ball.x - right) / 500 + ball.dy / 10;
                    } else if (left > ball.x) {
                        ball.y = top - Math.sqrt(Math.max(0, ball.radius ** 2 - (ball.x - left) ** 2));
                        ball.xPhysics += (ball.x - left) / 500 - ball.dy / 10;
                    } else {
                        ball.y = top - ball.radius;
                    }

                    if (ball.dy * ball.radius > platform.size / 12) {
                        
                        platform.yPhysics += ball.dy;
                        ball.strength -= 0.8;
                        platform.updated = true;
                        platform.hitPlatform(1);
                        if (!ball.isGameRunning) { ball.isGameRunning = true; }
                        if (platform.hits < 2) {
                            
                            ball.dy = Math.abs(ball.dy / 5);
                            
                        } else {
                            
                            platform.yPhysics = ball.dy;
                            ball.dy = Math.abs(ball.dy / 2);
                            
                            destorySplashes(platform,1);
                        }
                    } else {
                        ball.dy = platform.dy;
                    }

                    ball.canDoubleJump = true;
                    ball.isJumping = false;
                }
                //bottom
            } else if (ball.y - ball.radius < bottom && ball.y > bottom) {
                if ((ball.x >= left && ball.x <= right) || (right < ball.x && ball.radius >= Math.sqrt((ball.x - right) ** 2 + (ball.y - bottom) ** 2) || (left > ball.x && ball.radius >= Math.sqrt((left - ball.x) ** 2 + (ball.y - bottom) ** 2)))) {
                    if (ball.dy * ball.radius < -platform.size / 25) {
                        platform.yPhysics = ball.dy * 1.6;
                        platform.updated = true;
                        ball.strength -= 0.8;
                        platform.hitPlatform(0);
                        ball.canDoubleJump = false;
                        if (platform.hits < 2) {
                            ball.dy = Math.abs(ball.dy / 2) + platform.dy;
                           
                        } else {
                            
                            destorySplashes(platform,0);
                            ball.dy = ball.dy / 1.5;
                            
                            
                        }
                    } else {
                        if (ball.dy < platform.dy && ball.dy > canvas.height / 2000) {
                            ballHarming(ball);
                            genPlatSplashes.push(new Splash(ball.x, ball.y, ball.radius, 'white'));
                        }
                        else{
                            ball.dy = Math.abs(ball.dy / 2) + platform.dy;
                            
                        }
                        
                    }

                    
                    ball.isJumping = true;
                }
            }
        }

        
    }

    generatePlatforms();

    return {
        platforms,
        drawPlatforms,
        generatePlatforms,
        updatePlatforms
    };
}