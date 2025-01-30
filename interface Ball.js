export class GrapplingHook {
    constructor(ball, worldBounds) {
        this.ball = ball;
        this.worldBounds = worldBounds;
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.length = 0;
        this.maxLength = 500; // Maximum length of the grappling hook
        this.speed = 15; // Speed of the hook
        this.retracting = false;
    }

    shoot(targetX, targetY) {
        if (!this.active) {
            this.active = true;
            this.x = this.ball.x;
            this.y = this.ball.y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.length = 0;
            this.retracting = false;
        }
    }

    retract() {
        if (this.active) {
            this.retracting = true;
        }
    }

    update() {
        if (!this.active) return;

        if (!this.retracting) {
            // Extend the hook
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.speed) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
                this.length = Math.sqrt((this.x - this.ball.x) ** 2 + (this.y - this.ball.y) ** 2);
            } else {
                this.x = this.targetX;
                this.y = this.targetY;
            }

            // Check if hook has reached maximum length
            if (this.length >= this.maxLength) {
                this.retract();
            }
        } else {
            // Retract the hook
            const dx = this.ball.x - this.x;
            const dy = this.ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.speed) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            } else {
                this.reset();
            }
        }

        // Move the ball towards the hook point
        if (this.length > 10) { // Only move if the hook is a certain distance away
            const pullStrength = 0.05; // Adjust this to change how strongly the ball is pulled
            this.ball.x += (this.x - this.ball.x) * pullStrength;
            this.ball.y += (this.y - this.ball.y) * pullStrength;
        }
    }

    reset() {
        this.active = false;
        this.x = this.ball.x;
        this.y = this.ball.y;
        this.length = 0;
        this.retracting = false;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.beginPath();
        ctx.moveTo(this.ball.x, this.ball.y);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw hook end
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}