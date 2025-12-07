class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.score = 0;
        this.lives = 3;
        this.state = 'START'; // START, PLAYING, GAMEOVER, WIN

        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        this.brickManager = new BrickManager(this);
        this.particleSystem = new ParticleSystem(this);

        this.input = new InputHandler(this);
        
        this.lastTime = 0;
        this.shakeTime = 0;
        this.shakeMagnitude = 0;

        this.ui = {
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            winScreen: document.getElementById('win-screen'),
            finalScore: document.getElementById('final-score'),
            winScore: document.getElementById('win-score')
        };

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    start() {
        this.state = 'PLAYING';
        this.score = 0;
        this.lives = 3;
        this.brickManager.reset();
        this.ball.reset();
        this.paddle.reset();
        this.updateUI();
        this.ui.startScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.winScreen.classList.add('hidden');
    }

    update(deltaTime) {
        if (this.state !== 'PLAYING') return;

        this.paddle.update(deltaTime);
        this.ball.update(deltaTime);
        this.particleSystem.update(deltaTime);

        // Screen shake decay
        if (this.shakeTime > 0) {
            this.shakeTime -= deltaTime;
            if (this.shakeTime < 0) this.shakeTime = 0;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Screen Shake
        this.ctx.save();
        if (this.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * this.shakeMagnitude;
            const dy = (Math.random() - 0.5) * this.shakeMagnitude;
            this.ctx.translate(dx, dy);
        }

        this.paddle.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.brickManager.draw(this.ctx);
        this.particleSystem.draw(this.ctx);

        this.ctx.restore();
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    screenShake(duration, magnitude) {
        this.shakeTime = duration;
        this.shakeMagnitude = magnitude;
    }

    updateUI() {
        this.ui.score.textContent = this.score;
        this.ui.lives.textContent = this.lives;
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.ui.finalScore.textContent = this.score;
        this.ui.gameOverScreen.classList.remove('hidden');
    }

    win() {
        this.state = 'WIN';
        this.ui.winScore.textContent = this.score;
        this.ui.winScreen.classList.remove('hidden');
    }
}

class InputHandler {
    constructor(game) {
        this.game = game;
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (this.game.state === 'START' || this.game.state === 'GAMEOVER' || this.game.state === 'WIN') {
                    this.game.start();
                }
            }
            if (e.code === 'ArrowLeft') this.game.paddle.moveLeft = true;
            if (e.code === 'ArrowRight') this.game.paddle.moveRight = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft') this.game.paddle.moveLeft = false;
            if (e.code === 'ArrowRight') this.game.paddle.moveRight = false;
        });
    }
}

class Paddle {
    constructor(game) {
        this.game = game;
        this.width = 120;
        this.height = 20;
        this.speed = 0.8;
        this.color = '#00f3ff';
        this.reset();
    }

    reset() {
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - 40;
        this.moveLeft = false;
        this.moveRight = false;
    }

    update(deltaTime) {
        if (this.moveLeft) this.x -= this.speed * deltaTime;
        if (this.moveRight) this.x += this.speed * deltaTime;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
    }

    draw(ctx) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Ball {
    constructor(game) {
        this.game = game;
        this.radius = 8;
        this.speed = 0.4; // Base speed
        this.maxSpeed = 0.8;
        this.color = '#ffffff';
        this.reset();
    }

    reset() {
        this.x = this.game.width / 2;
        this.y = this.game.height - 60;
        this.dx = (Math.random() < 0.5 ? -1 : 1) * this.speed; // Random X direction
        this.dy = -this.speed;
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;

        // Wall collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.dx = -this.dx;
        }
        if (this.x + this.radius > this.game.width) {
            this.x = this.game.width - this.radius;
            this.dx = -this.dx;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.dy = -this.dy;
        }

        // Paddle collision
        if (this.checkCollision(this.game.paddle)) {
            this.dy = -Math.abs(this.dy); // Always bounce up
            this.y = this.game.paddle.y - this.radius;
            
            // Add some English based on where it hit the paddle
            const hitPoint = this.x - (this.game.paddle.x + this.game.paddle.width / 2);
            this.dx = hitPoint * 0.005; 
            
            // Speed up slightly
            const currentSpeed = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
            if(currentSpeed < this.maxSpeed) {
                 this.dx *= 1.05;
                 this.dy *= 1.05;
            }

            this.game.particleSystem.createExplosion(this.x, this.y + this.radius, '#00f3ff', 10);
        }

        // Brick collision
        this.game.brickManager.bricks.forEach(brick => {
            if (!brick.active) return;
            if (this.checkCollision(brick)) {
                brick.hit();
                this.dy = -this.dy; // Simple bounce
                this.game.score += 10;
                this.game.updateUI();
                this.game.screenShake(100, 5);
                
                if (this.game.brickManager.checkWin()) {
                    this.game.win();
                }
            }
        });

        // Bottom collision (Death)
        if (this.y + this.radius > this.game.height) {
            this.game.lives--;
            this.game.updateUI();
            this.game.screenShake(300, 10);
            if (this.game.lives <= 0) {
                this.game.gameOver();
            } else {
                this.reset();
            }
        }
    }

    checkCollision(rect) {
        // Circle-Rectangle collision
        let testX = this.x;
        let testY = this.y;

        if (this.x < rect.x) testX = rect.x;
        else if (this.x > rect.x + rect.width) testX = rect.x + rect.width;
        
        if (this.y < rect.y) testY = rect.y;
        else if (this.y > rect.y + rect.height) testY = rect.y + rect.height;

        const distX = this.x - testX;
        const distY = this.y - testY;
        const distance = Math.sqrt((distX * distX) + (distY * distY));

        return distance <= this.radius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

class BrickManager {
    constructor(game) {
        this.game = game;
        this.rows = 5;
        this.cols = 8;
        this.padding = 10;
        this.marginTop = 80;
        this.bricks = [];
        this.colors = ['#ff00ff', '#ff00aa', '#ff0055', '#ff0000', '#ff5500'];
        
        // Calculate brick size
        this.brickWidth = (this.game.width - (this.cols + 1) * this.padding) / this.cols;
        this.brickHeight = 30;

        this.reset();
    }

    reset() {
        this.bricks = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = this.padding + c * (this.brickWidth + this.padding);
                const y = this.marginTop + r * (this.brickHeight + this.padding);
                const color = this.colors[r % this.colors.length];
                this.bricks.push(new Brick(this.game, x, y, this.brickWidth, this.brickHeight, color));
            }
        }
    }

    draw(ctx) {
        this.bricks.forEach(brick => brick.draw(ctx));
    }

    checkWin() {
        return this.bricks.every(b => !b.active);
    }
}

class Brick {
    constructor(game, x, y, w, h, color) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.color = color;
        this.active = true;
    }

    hit() {
        this.active = false;
        this.game.particleSystem.createExplosion(
            this.x + this.width / 2, 
            this.y + this.height / 2, 
            this.color, 
            20
        );
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
    }

    createExplosion(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.2 + 0.1;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.life = 1.0; // 1.0 to 0.0
        this.decay = Math.random() * 0.002 + 0.001;
        this.size = Math.random() * 3 + 2;
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        this.life -= this.decay * deltaTime;
        this.size *= 0.99; // Shrink over time
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

// Start the game
window.onload = () => {
    new Game();
};
