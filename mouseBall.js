import { mouseXAdjusted, mouseYAdjusted } from './player.js';
export function mouseBall(ball,ctx){
    function draw(ball , ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'white';
        ctx.shadowBlur = ball.radius/6;
        ctx.beginPath();
        ctx.arc(mouseXAdjusted, mouseYAdjusted, ball.radius/6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    draw(ball,ctx);
}
