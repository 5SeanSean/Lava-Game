export const projectiles = [];


class Projectile {
    constructor(x, y, angle, speed, color, size, shape = 'circle', type ='playerProjectile') {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.color = color;
        this.size = size;
        this.shape = shape;
        this.type = type;
    }

update() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;
}

draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
}

isOutOfBounds(worldBounds) {
    return (
        this.x < worldBounds.left ||
        this.x > worldBounds.right ||
        this.y < worldBounds.top ||
        this.y > worldBounds.bottom
    );
}
}