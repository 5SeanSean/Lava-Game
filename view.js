// filepath: /h:/Downloads/PLATZIO/view.js
export const worldBounds = {
    left: 0,
    right: window.innerWidth * 3, // Allow movement 3 times the canvas width to the right
    top: 0,
    bottom: window.innerHeight*3
};

export function setupView(canvas, ctx, ball) {
    const camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };

    function updateCamera() {
        // Center the camera on the ball's x position
        camera.x = ball.x - camera.width / 2;
        camera.y = ball.y - camera.height / 2;
        // Clamp the camera position within the world bounds
        camera.x = Math.max(worldBounds.left, Math.min(camera.x, worldBounds.right - camera.width));
        camera.y = Math.max(worldBounds.top, Math.min(camera.y, worldBounds.bottom - camera.height));
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawWithCamera(drawFunction) {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        drawFunction(ctx);
        ctx.restore();
    }

    return {
        camera,
        updateCamera,
        clearCanvas,
        drawWithCamera
    };
}