import { ballHarming } from './player.js';
import { Splash } from './splash.js';

export function getRandomLavaColor() {
    let color;
    switch (Math.floor(Math.random() * 4)) {
        
        case 0:
            color = 'darkred';
            break;
        case 1:
            color = 'black';
            break;
        case 2:
            color = 'orange';
            break;
        case 3:
            color = 'yellow';
            break;
    }
    return color;
}
export function createLava(worldBounds,canvas) {
    const lines = [];
    const splashes = []; // Initialize splashes array

    let killed= false;
    // Function to generate random rectangles
    
    function generateLines() {
        for (let i = 0; i < 150; i++) {
            let color= getRandomLavaColor();
            
            

            lines.push({
                x: Math.random() * worldBounds.right,
                y: worldBounds.bottom - 50 + Math.random() * 50,
                width: Math.random() * 70 + 60,
                height: Math.random() * 30 + 10, // Fixed height for the rectangles
                speed: Math.random() * 0.5 + 0.5,
                color: color
            });
        }
    }

    // Generate initial lines
    generateLines();

    return {
        x: 0,
        y: worldBounds.bottom - canvas.height/18,
        width: worldBounds.right,
        height: canvas.height/18,
        draw(ctx) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw moving rectangles
            lines.forEach(line => {
                ctx.fillStyle = line.color;
                ctx.fillRect(line.x, line.y, line.width, line.height);
            });

            // Draw splashes
            splashes.forEach(splash => splash.draw(ctx));
        },

        update(consumables) {
            // Update rectangle positions
            lines.forEach(line => {
                line.x += line.speed;
                if (line.x > worldBounds.right) {
                    line.x = -line.width;
                    line.y = worldBounds.bottom - 50 + Math.random() * 50;
                    line.color = getRandomLavaColor();
                }
            });

            for (let i = consumables.length - 1; i >= 0; i--) {
                const consumable = consumables[i];

                if (consumable.y + consumable.size > this.y && !consumable.splashed) {
                    // Consumable has collided with lava
                    splashes.push(new Splash(consumable.x, this.y, 5, getRandomLavaColor()));
                    consumable.splashed = true;
                    consumable.dy = 0;
                    consumable.gravity = 0;
                    consumable.dx = Math.random() * 0.5 + 0.5;
                }
            }
            // Update splashes
            splashes.forEach(splash => splash.update());
            // Filter out finished splashes without reassigning the array
            for (let i = splashes.length - 1; i >= 0; i--) {
                if (splashes[i].isFinished()) {
                    splashes.splice(i, 1);
                }
            }
        },
        
        
        checkKillCollision(ball) {
            return (
                
                ball.y  > this.y 
            );
        },
        
        handleCollision(ball) {
            
            if (this.checkKillCollision(ball)) {
                splashes.push(new Splash(ball.x, ball.y, ball.dy, getRandomLavaColor())); 
                ballHarming(ball);
                }
                    
                  
            }
        
        
    };
}