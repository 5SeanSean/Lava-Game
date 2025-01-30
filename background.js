
export class Background {
    constructor(canvas, worldBounds) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldBounds = worldBounds;
        this.rocks = [];
        this.generateRocks();
        this.parallaxFactor = -0.5; // Adjust this value to control the background movement speed
        this.dirtColor = '#6B3E26';
        
        this.streaks = this.generateStreaks();
        this.topOverlayColor = 'rgba(0, 0, 0, 0.65)'; // Semi-transparent black
        this.bottomGlowColor = 'rgba(255, 215, 0, 0.8)'; // Semi-transparent gold
    }
    drawOverlay(ball) {
        let offsetX = 0;
        let offsetY =0;
         offsetX = ball.x * this.parallaxFactor;
         offsetY = ball.y * this.parallaxFactor;

        const gradient = this.ctx.createLinearGradient(
            0, this.worldBounds.top - offsetY,
            0, this.worldBounds.bottom - offsetY
        );

        // Add color stops for a smoother gradient
        
        gradient.addColorStop(0, this.topOverlayColor);
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        
        gradient.addColorStop(1, this.bottomGlowColor);

        // Draw the gradient overlay
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            this.worldBounds.left - offsetX,
            this.worldBounds.top - offsetY,
            this.worldBounds.right - this.worldBounds.left,
            this.worldBounds.bottom - this.worldBounds.top
        );
    }
   

    generateRocks() {
        const rockCount = 200; // Adjust this for more or fewer rocks
        for (let i = 0; i < rockCount; i++) {
            this.rocks.push(this.createRock());
        }
    }

    generateStreaks() {
        const streakCount = 400; // Adjust for more or fewer streaks
        const streaks = [];
        for (let i = 0; i < streakCount; i++) {
            streaks.push({
                x: Math.random() * this.worldBounds.right,
                y: Math.random() * this.worldBounds.bottom,
                width: Math.random() * 40 + 40, // Random width between 20 and 70
                height: Math.random() * 300 + 100, // Random height between 5 and 15
                angle: Math.random() * Math.PI/5 +Math.PI/2.5, // Random angle
                color: this.getRandomEarthTone() // Random earth-tone color
            });
        }
        return streaks;
    }
    getRandomEarthTone() {
        const earthTones = [
            '#8B4513', // Saddle Brown
            '#A0522D', // Sienna
            '#D2691E', // Chocolate
            '#CD853F', // Peru
            '#DEB887', // Burlywood
            '#D2B48C', // Tan
            
        ];
        return earthTones[Math.floor(Math.random() * earthTones.length)];
    }
    createRock() {
        const x = Math.random() * (this.worldBounds.right - this.worldBounds.left) + this.worldBounds.left;
        const y = Math.random() * (this.worldBounds.bottom - this.worldBounds.top) + this.worldBounds.top;
        const size = Math.random() * 200 + 50; // Random size between 50 and 150
        const points = Math.floor(Math.random() * 3) + 5; // 5 to 7 points

        const rock = {
            x,
            y,
            size,
            points: [],
            color: this.getRandomGrayColor()
        };

        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const radius = size / 2 * (0.8 + Math.random() * 0.8); // Vary the radius a bit
            rock.points.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius
            });
        }

        return rock;
    }

    getRandomGrayColor() {
        const shade = Math.floor(Math.random() * 100) + 100; // 100-200
        return `rgb(${shade}, ${shade}, ${shade})`;
    }

    draw(camera) {
        const offsetX = camera.x * this.parallaxFactor;
        const offsetY = camera.y * this.parallaxFactor;

        // Draw the dirt background
        this.ctx.save();
        this.ctx.fillStyle = this.dirtColor;
        this.ctx.fillRect(
            this.worldBounds.left - offsetX,
            this.worldBounds.top - offsetY,
            this.worldBounds.right - this.worldBounds.left,
            this.worldBounds.bottom - this.worldBounds.top
        );
        this.ctx.restore();
        this.ctx.fillStyle = this.streakColor;
        this.streaks.forEach(streak => {
            this.ctx.save();
            this.ctx.translate(streak.x - offsetX, streak.y - offsetY);
            this.ctx.rotate(streak.angle);
            this.ctx.fillStyle = streak.color;
            this.ctx.fillRect(-streak.width / 2, -streak.height / 2, streak.width, streak.height);
            this.ctx.restore();
        });
        // Draw the rocks
        this.rocks.forEach(rock => {
            this.ctx.save();
            this.ctx.translate(-offsetX, -offsetY);
            this.ctx.beginPath();
            this.ctx.moveTo(rock.points[0].x, rock.points[0].y);
            for (let i = 1; i < rock.points.length; i++) {
                this.ctx.lineTo(rock.points[i].x, rock.points[i].y);
            }
            this.ctx.closePath();
            this.ctx.fillStyle = rock.color;
            this.ctx.fill();
            this.ctx.restore();
            

        });
        this.drawOverlay(camera);
        this.drawOverlay(camera);
        
    }
}