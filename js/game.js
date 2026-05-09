import Paddle from "./paddle.js";
import Ball from "./ball.js";
import Brick from "./brick.js";
import { circleRectCollision } from "./collision.js";
import UI from "./ui.js";

export default class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.paddle = new Paddle(canvas);
        this.ball = new Ball(canvas);
        this.ui = new UI();

        this.level = 1;
        this.state = "menu"; // menu | playing | levelcomplete | gameover | win
        this.started = false;
        this.paused = false;

        this.particles = [];
        this.powerUps = [];

        this.combo = 0;
        this.comboTimer = 0;
        this.scoreMultiplier = 1;

        this.setLevel(1);
    }

    setLevel(level) {
        this.level = level;
        this.ball.reset();
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.bricks = this.createBricks(level === 3);
    }

    createBricks(strong) {
        const bricks = [];
        const rows = 3;
        const cols = 10;
        const bw = 70;
        const bh = 20;
        const pad = 10;

        const offsetX = (this.canvas.width - (cols * bw + (cols - 1) * pad)) / 2;
        const offsetY = 120;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let hp = strong ? (Math.random() < 0.3 ? 2 : 1) : 1;
                bricks.push(new Brick(c * (bw + pad) + offsetX, r * (bh + pad) + offsetY, bw, bh, hp));
            }
        }
        return bricks;
    }

    spawnPowerUp(x, y) {
        if (Math.random() > 0.2) return;
        const types = ["paddle", "slow", "life"];
        this.powerUps.push({
            x, y,
            type: types[Math.floor(Math.random() * types.length)],
            dy: 2,
            collected: false
        });
    }

    spawnParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x, y,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
                life: 1
            });
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.life -= 0.03;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

   update() {
    // ❌ Oyun oynanmıyorsa veya duraklatılmışsa hiçbir şey yapma
    if (this.state !== "playing" || this.paused) return;

    // UI animasyonlarını güncelle (skor yükselmesi, uçan yazılar vb.)
    this.ui.update();

    // Player ve Top hareketleri
    this.paddle.move();
    this.ball.move(this.paddle);

    // =========================
    // 🔥 COMBO TIMER SYSTEM
    // =========================
    if (this.comboTimer > 0) this.comboTimer--;
    else {
        this.combo = 0;
        this.scoreMultiplier = 1;
    }

    // =========================
    // 🧱 BRICK COLLISION (Tuğla Çarpışma)
    // =========================
    this.bricks.forEach(b => {
        if (b.active && circleRectCollision(this.ball, b)) {
            b.hit();              // Tuğla canını azalt
            this.ball.dy *= -1;   // Topu geri sektir

            // Kombo ve skor hesaplama
            this.combo++;
            this.comboTimer = 120;
            this.scoreMultiplier = 1 + Math.floor(this.combo / 3);

            this.ui.addScore(10 * this.scoreMultiplier, b.x, b.y);

            this.spawnParticles(b.x, b.y);
            this.spawnPowerUp(b.x, b.y);
        }
    });

    // =========================
    // 🎁 POWER-UP UPDATE (Eşya Toplama)
    // =========================
    this.powerUps.forEach(p => {
        p.y += p.dy; // Aşağı düşme hızı

        // Raketle çarpışma kontrolü
        if (
            p.y > this.paddle.y &&
            p.y < this.paddle.y + this.paddle.height &&
            p.x > this.paddle.x &&
            p.x < this.paddle.x + this.paddle.width
        ) {
            // 🟢 Yeşil: Raket büyütme
            if (p.type === "paddle") {
                const oldWidth = this.paddle.width;
                this.paddle.width += 30;
                this.paddle.x -= (this.paddle.width - oldWidth) / 2;
            }

            // 🔵 Cyan: Top yavaşlatma (ALT LİMİT EKLENDİ)
            if (p.type === "slow") {
                // Topun hızı orijinalin %40'ının altına düşmesin (sakız gibi olmaması için)
                if (this.ball.speedMultiplier > 0.4) {
                    this.ball.speedMultiplier *= 0.8;
                }
            }

            // 🔴 Kırmızı: Ekstra Can
            if (p.type === "life") {
                this.ui.lives++;
            }

            p.collected = true; // Toplandığını işaretle
        }
    });

    // Toplanmış veya ekrandan çıkmış olanları temizle
    this.powerUps = this.powerUps.filter(p => !p.collected && p.y < this.canvas.height);

    // =========================
    // 💀 LOSE CONDITION (Can Kaybı / Game Over)
    // =========================
    if (this.ball.y > this.canvas.height) {
        this.ui.lives--;

        if (this.ui.lives <= 0) {
            this.state = "gameover";
            this.ui.gameOver = true;
        } else {
            this.ball.reset(); // Sadece topu sıfırla, oyuna devam et
        }
    }

    // =========================
    // 🏁 LEVEL COMPLETE / WIN CHECK
    // =========================
    if (this.bricks.every(b => !b.active)) {
        if (this.level >= 3) {
            this.state = "win";
            this.ui.win = true;
        } else {
            this.state = "levelcomplete";
        }
    }

    this.updateParticles(); // Görsel efektleri güncelle
}

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === "menu") {
            this.drawMenu();
            return;
        }

        // Oyun objelerini her durumda çiz (Win/GameOver dahil arkada gözüksünler)
        this.paddle.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.bricks.forEach(b => b.draw(this.ctx));

        this.powerUps.forEach(p => {
            this.ctx.fillStyle = p.type === "paddle" ? "#00ff00" : p.type === "slow" ? "#00ffff" : "#ff0000";
            this.ctx.fillRect(p.x, p.y, 15, 15);
        });

        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = "#00ffff";
            this.ctx.fillRect(p.x, p.y, 3, 3);
            this.ctx.globalAlpha = 1;
        });

        this.ui.draw(this.ctx);

        if (this.state === "levelcomplete") this.drawLevelComplete();
        if (this.paused) this.drawPause();
    }

    drawMenu() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#00ffff";
        this.ctx.font = "60px Arial";
        this.ctx.fillText("BREAKOUT", w / 2, h / 2 - 120);
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Press SPACE to Start", w / 2, h / 2);
        this.ctx.fillText("ESC Pause | R Restart | 🠔🠖 Controls", w / 2, h / 2 + 40);
    }

    drawLevelComplete() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.fillStyle = "rgba(0,0,0,0.8)";
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#00ffff";
        this.ctx.font = "50px Arial";
        this.ctx.fillText(`LEVEL ${this.level} COMPLETE`, w / 2, h / 2 - 20);
        this.ctx.fillStyle = "white";
        this.ctx.font = "22px Arial";
        this.ctx.fillText("Press SPACE for Next Level", w / 2, h / 2 + 40);
    }

    drawPause() {
        this.ctx.fillStyle = "rgba(0,0,0,0.6)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.font = "40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("PAUSED", this.canvas.width / 2, this.canvas.height / 2);
    }

    loop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    };

    start() { this.loop(); }

    restart() {
        this.ui.reset();
        this.level = 1;
        this.started = false;
        this.state = "menu";
        this.paused = false;
        this.setLevel(1);
        this.particles = [];
        this.powerUps = [];
    }
}