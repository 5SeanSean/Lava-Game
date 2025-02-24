// filepath: /h:/Downloads/PLATZIO/main.js
import { worldBounds,setupView } from './view.js';
import { drawConsumables, updateConsumables } from './playerConsumables.js';
import { setupPlatforms } from './platforms.js';
import { setupEnemies } from './enemy.js';
import { setupPlayer } from './player.js';
import { createLava } from './lava.js';
import { Background } from './background.js';
import { generalSplashes } from './splash.js';

function setup() {

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to fill the screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fadeOverlay = document.getElementById('fadeOverlay');
    // Add this near the top of your setup function
    let isWindowFocused = true;
    window.addEventListener('focus', () => {
        isWindowFocused = true;
        
    });
    
    window.addEventListener('blur', () => {
        isWindowFocused = false;
        
    });
    function fadeIn() {
        fadeOverlay.style.opacity = '1';
        fadeOverlay.style.display = 'block';
        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
            setTimeout(() => {
                fadeOverlay.style.display = 'none';
            }, 2000); // Hide the overlay after the fade transition completes
        }, 100);
    }

    // Initial fade in
    fadeIn();
    

    // Initialize platform-related functions and variables
    const platformsObj = setupPlatforms(canvas, worldBounds);
    const platforms = platformsObj.platforms; // Extract the platforms array
    const updatePlatforms = platformsObj.updatePlatforms;
    const { drawBall, drawProjectiles, updateBall, updateProjectiles, handleShooting, ball, projectiles, resetPlayer } = setupPlayer(canvas, ctx, platforms, endGame, worldBounds);
    const background = new Background(canvas, worldBounds);

    // Define the consumables array
    const consumables = [];
    let gameActive = true;

    // Initialize lava
    let lava = createLava(worldBounds, canvas);

    // Define the endGame function

    function endGame() {
        ball.isGameRunning = false;
        // Display the overlay and restart button
        const overlay = document.getElementById('gameOverlay');
        overlay.style.visibility = 'visible';
        gameActive = false; // Set gameActive to false to stop all entities

        // Show the score counter at the middle of the screen
        const scoreCounter = document.getElementById('scoreCounter');
        
        scoreCounter.style.top = '65%';
        scoreCounter.style.left = '50%';
        scoreCounter.style.transform = 'translate(-50%, -50%)';
    }
 

    // Initialize player-related functions and variables first
   

    // Initialize view-related functions and variables
    const { camera, updateCamera, clearCanvas, drawWithCamera } = setupView(canvas, ctx, ball);

    // Initialize enemy-related functions and variables
    const { drawEnemies, updateEnemies, enemies } = setupEnemies(canvas, ctx, ball, endGame, platforms, projectiles, consumables, worldBounds);

    // Add event listener for the restart button
    document.getElementById('restartButton').addEventListener('click', () => {
        resetPlayer();
        enemies.length = 0; // Clear the enemies array
        platformsObj.generatePlatforms(); // No need to pass worldBounds
        consumables.length = 0; // Clear the consumables array
        lava = createLava(worldBounds, canvas); // Re-initialize lava
        document.getElementById('gameOverlay').style.visibility = 'hidden';
        gameActive = true; // Set gameActive to true to resume the game
        const scoreCounter = document.getElementById('scoreCounter');
       
        scoreCounter.style.top = '2%';
        scoreCounter.style.left = '2%';
        scoreCounter.style.transform = 'translate(0,0)';
        fadeIn();
    });

    // Add event listener for the spacebar to reset the game
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !gameActive) {
            resetPlayer();
            enemies.length = 0; // Clear the enemies array
            platformsObj.generatePlatforms(); // No need to pass worldBounds
            consumables.length = 0;
            lava = createLava(worldBounds, canvas); // Re-initialize lava
            document.getElementById('gameOverlay').style.visibility = 'hidden';

            gameActive = true; // Set gameActive to true to resume the game
            scoreCounter.style.top = '2%';
        scoreCounter.style.left = '2%';
        scoreCounter.style.transform = 'translate(0,0)';
            fadeIn();
        }
    });
    
    // Update game logic at 128 ticks per second using setInterval
    const tickDuration = 1000 / 120; // 128 ticks per second
    setInterval(() => {
        if (gameActive&& isWindowFocused) {
            updateConsumables(consumables, ball, projectiles, endGame, platforms, worldBounds, enemies, createLava);
            updateBall();
            handleShooting();
            updateProjectiles();
            generalSplashes.forEach(splash => {
                splash.update();
                });
            updateEnemies();
            updatePlatforms(ball);
            lava.update(consumables); // Update lava
            lava.handleCollision(ball, endGame); // Check collision with lava
        }
    }, tickDuration);

    // Draw game elements using requestAnimationFrame
    function draw() {
        if (gameActive) {
            clearCanvas();
            updateCamera();
            drawWithCamera(() => {
                background.draw(camera);
                platformsObj.drawPlatforms(ctx);
                drawEnemies();
                generalSplashes.forEach(splash => splash.draw(ctx));
                drawConsumables(ctx, consumables);
                lava.draw(ctx); // Draw lava
                drawProjectiles();
                drawBall();
                background.drawOverlay(camera);
                lava.draw(ctx); // Draw lava
            });
        }
        requestAnimationFrame(draw);
    }

    draw();
}

window.onload = setup;