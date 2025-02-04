import { createLava } from './lava.js';
import { Splash } from './splash.js';
import { worldBounds } from './view.js';



export function setupPlatforms(canvas, worldBounds) {
    const maxPlatDY = (canvas.height/1000);
    const platforms = [];
    const splashes = [];
    
    function newPlatform()
    {
        platforms.push({
            x: Math.random() * (worldBounds.right),
            y:-30,
            width: Math.random() *(worldBounds.right/30) + (worldBounds.right/50),
            height: Math.random() *(worldBounds.bottom/100) + (worldBounds.bottom/200),
            dy: Math.random() *(canvas.height/3000)+(canvas.height/2000),
            yPhysics: 0,
            hits: 0,
            color: '#354859', // Initial color
            hitRectangles: [],
            harmsEnemies: false,
            hitPlatform: function() {
                this.hits++;
                this.harmsEnemies = true;
                setTimeout(() => {
                    this.harmsEnemies = false;
                }, 1);
                if (this.hits === 1) {
                    this.generateHitRectangles(0.5); 
                    this.generateSplashes('#354859');
                } else if (this.hits === 2) {
                    this.hitRectangles = [];
                    this.color = 'grey'; 
                    this.generateSplashes('grey');
                } else if (this.hits >= 3) {
                    this.toRemove = true;
                    this.generateSplashes('#808080'); // Mark for removal on third hit
                }
            },
            generateHitRectangles: function(percentage) {
                const totalArea = this.width * this.height;
                const areaToFill = totalArea * percentage;
                let filledArea = 0;

                this.hitRectangles = [];
                while (filledArea < areaToFill) {
                    const rectWidth = Math.random() * (this.width / 4) + 5; // Random width between 5 and 1/4 of platform width
                    const rectHeight = Math.random() * (this.height / 2) + 5; // Random height between 5 and 1/2 of platform height
                    const rectX = Math.random() * (this.width - rectWidth);
                    const rectY = Math.random() * (this.height - rectHeight);

                    this.hitRectangles.push({x: rectX, y: rectY, width: rectWidth, height: rectHeight});
                    filledArea += rectWidth * rectHeight;
                }
            },
            generateSplashes: function(color) {
                for (let i = 0; i < 5; i++) { // Generate 5 splashes
                    const splash = new Splash(
                        this.x + Math.random() * this.width,
                        this.y + Math.random() * this.height,
                        this.width/10, // radius
                        color,
                        'square'
                    );
                    splashes.push(splash);
                }
            }
        });
    }
    function genSidePlatX(){
        let sideX;
        if(Math.random()>0.5){
            sideX = Math.random() * ((worldBounds.right/2)- (worldBounds.right/25) - (worldBounds.right/50));
        }
        else{
            sideX = Math.random() * ((worldBounds.right/2) - ((worldBounds.right/30) + (worldBounds.right/50)))+ (worldBounds.right/30) + (worldBounds.right/50)+ (worldBounds.right/2);
        }
        return sideX;
    }
    function startPlatforms()
    {
        
        platforms.push({
            
            x: genSidePlatX(),
            y: Math.random() * (worldBounds.bottom-100),
            width: Math.random() *(worldBounds.right/30) + (worldBounds.right/50),
            height: Math.random() *(worldBounds.bottom/200) + (worldBounds.bottom/100),
            dy: Math.random() *(maxPlatDY - canvas.height/2000)+(canvas.height/2000),
            yPhysics: 0,
            hits: 0,
            color: '#354859', // Initial color
            hitRectangles: [],
            harmsEnemies: false,
            hitPlatform: function() {
                this.hits++;
                this.harmsEnemies = true;
                setTimeout(() => {
                    this.harmsEnemies = false;
                }, 1);
                if (this.hits === 1) {
                    this.generateHitRectangles(0.5); 
                    this.generateSplashes('#354859');
                } else if (this.hits === 2) {
                    this.hitRectangles = [];
                    this.color = 'grey'; 
                    this.generateSplashes('grey');
                } else if (this.hits >= 3) {
                    this.toRemove = true;
                    this.generateSplashes('#808080'); // Mark for removal on third hit
                }
            },
            generateHitRectangles: function(percentage) {
                const totalArea = this.width * this.height;
                const areaToFill = totalArea * percentage;
                let filledArea = 0;

                this.hitRectangles = [];
                while (filledArea < areaToFill) {
                    const rectWidth = Math.random() * (this.width / 4) + 5; // Random width between 5 and 1/4 of platform width
                    const rectHeight = Math.random() * (this.height / 2) + 5; // Random height between 5 and 1/2 of platform height
                    const rectX = Math.random() * (this.width - rectWidth);
                    const rectY = Math.random() * (this.height - rectHeight);

                    this.hitRectangles.push({x: rectX, y: rectY, width: rectWidth, height: rectHeight});
                    filledArea += rectWidth * rectHeight;
                }
            },
            generateSplashes: function(color) {
                for (let i = 0; i < 5; i++) { // Generate 5 splashes
                    const splash = new Splash(
                        this.x + Math.random() * this.width,
                        this.y + Math.random() * this.height,
                        this.width/10, // radius
                        color,
                        'square'
                    );
                    splashes.push(splash);
                }
            }
        });
    }
    function generatePlatforms() {
        // Clear existing platforms
        platforms.length = 0;

        
        

        // Generate platforms on each side
        const platformCount = 100; // Adjust this number as needed
        
        

        for (let i = 0; i < platformCount; i++) {
            // Left side platforms
            startPlatforms();

            
        }
        platforms.push({
            
            x: worldBounds.right/2-100,
            y: worldBounds.bottom/1.6,
            width: 200,
            height: Math.random() *(worldBounds.bottom/200) + (worldBounds.bottom/100),
            dy: Math.random() *(canvas.height/3000)+(canvas.height/2000),
            yPhysics: 0,
            hits: 0,
            color: '#354859', // Initial color
            hitRectangles: [],
            harmsEnemies: false,
            hitPlatform: function() {
                this.hits++;
                
                this.harmsEnemies = true;
                setTimeout(() => {
                    this.harmsEnemies = false;
                }, 1);
                if (this.hits === 1) {
                    this.generateHitRectangles(0.5); 
                    this.generateSplashes('#354859');
                    
                } else if (this.hits === 2) {
                    this.hitRectangles = [];
                    this.color = 'grey'; 
                    this.generateSplashes('grey');
                } else if (this.hits >= 3) {
                    this.toRemove = true;
                    this.generateSplashes('#808080'); // Mark for removal on third hit
                }
            },
            generateHitRectangles: function(percentage) {
                const totalArea = this.width * this.height;
                const areaToFill = totalArea * percentage;
                let filledArea = 0;

                this.hitRectangles = [];
                while (filledArea < areaToFill) {
                    const rectWidth = Math.random() * (this.width / 4) + 5; // Random width between 5 and 1/4 of platform width
                    const rectHeight = Math.random() * (this.height / 2) + 5; // Random height between 5 and 1/2 of platform height
                    const rectX = Math.random() * (this.width - rectWidth);
                    const rectY = Math.random() * (this.height - rectHeight);

                    this.hitRectangles.push({x: rectX, y: rectY, width: rectWidth, height: rectHeight});
                    filledArea += rectWidth * rectHeight;
                }
            },
            generateSplashes: function(color) {
                for (let i = 0; i < 5; i++) { // Generate 5 splashes
                    const splash = new Splash(
                        this.x + Math.random() * this.width,
                        this.y + Math.random() * this.height,
                        this.width/10, // radius
                        color,
                        'square'
                    );
                    splashes.push(splash);
                }
            }
        });
    }

    
    

    function drawPlatforms(ctx) {
        platforms.forEach(platform => {
            // Draw the base platform
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Draw thin grey underline
            ctx.fillStyle = 'grey';
            ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 2); // 2 pixels thick underline

            // Draw grey rectangles for hits
            if (platform.hitRectangles.length > 0) {
                ctx.fillStyle = 'grey';
                platform.hitRectangles.forEach(rect => {
                    ctx.fillRect(platform.x + rect.x, platform.y + rect.y, rect.width, rect.height);
                });
            }
        });
        splashes.forEach(splash => splash.draw(ctx));
    }

    function updatePlatforms() {
        // Instead of reassigning, we'll remove elements in-place
        for (let i = platforms.length - 1; i >= 0; i--) {
           
            platforms[i].y+=(platforms[i].dy+platforms[i].yPhysics);
            platforms.forEach(otherPlatform => {
                if (otherPlatform !== this) {
                
                let iLeft = platforms[i].x;
                let iRight = platforms[i].x + platforms[i].width;
                let jLeft = otherPlatform.x;
                let jRight = otherPlatform.x + otherPlatform.width;
                if (  platforms[i].y + platforms[i].height > otherPlatform.y && platforms[i].y <otherPlatform.y && ((iLeft > jLeft && iLeft < jRight) || (iRight > jLeft && iRight < jRight))) {
                    // Collision detected, set dy and yPhysics to the higher value
                    otherPlatform.y = platforms[i].y + platforms[i].height;
                    
                    let newDY= (platforms[i].dy+ otherPlatform.dy)/2;
                    platforms[i].dy = newDY;
                    otherPlatform.dy = newDY;
                    let newPhysics = (platforms[i].yPhysics+otherPlatform.yPhysics)/2;
                    platforms[i].yPhysics = newPhysics;
                    
                    otherPlatform.yPhysics = newPhysics;
                }
            }
        });
            if(platforms[i].yPhysics != 0){
                platforms[i].yPhysics/=1.1;
            }
            if(Math.abs(platforms[i].yPhysics) <=0.3){
                platforms[i].yPhysics = 0;
            }
            if(platforms[i].y>worldBounds.bottom + 50){
                newPlatform();
                platforms[i].toRemove = true;
            }
            if (platforms[i].toRemove) {
                platforms.splice(i, 1);
            }
        }
        for (let i = splashes.length - 1; i >= 0; i--) {
            splashes[i].update();
            if (splashes[i].isFinished()) {
                splashes.splice(i, 1);
            }
        }
    }

    // Generate initial platforms
    generatePlatforms();
    
    return {
        platforms,
        drawPlatforms,
        generatePlatforms,
        updatePlatforms
    };
}
