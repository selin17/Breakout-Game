export default class UI {
    constructor() {
        this.score = 0;
        this.lives = 3;

        this.win = false;
        this.gameOver = false;

        this.scoreScale = 1;
        this.animSpeed = 0.08;

        this.floatTexts = [];
    }

    addScore(points, x, y) {
        this.score += points;
        this.scoreScale = 1.5;

        this.floatTexts.push({
            text: "+" + points,
            x,
            y,
            alpha: 1,
            dy: -1.5
        });
    }

    update() {
        this.scoreScale += (1 - this.scoreScale) * this.animSpeed;

        this.floatTexts.forEach(t => {
            t.y += t.dy;
            t.alpha -= 0.02;
        });

        this.floatTexts = this.floatTexts.filter(t => t.alpha > 0);
    }

    draw(ctx) {
        const w = ctx.canvas.width;

        // HUD
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, w, 60);

        // SCORE
        ctx.save();
        ctx.translate(40, 35);
        ctx.scale(this.scoreScale, this.scoreScale);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Score: " + this.score, 0, 0);

        ctx.restore();

        // LIVES
        ctx.font = "18px Arial";
        for (let i = 0; i < this.lives; i++) {
            ctx.fillText("❤️", w - 50 - i * 30, 35);
        }

        // FLOAT TEXT
        this.floatTexts.forEach(t => {
            ctx.fillStyle = `rgba(255,255,255,${t.alpha})`;
            ctx.fillText(t.text, t.x, t.y);
        });

        // ❌ GAME OVER
        if (this.gameOver) {
            ctx.save();

            const w = ctx.canvas.width;

            ctx.textAlign = "center";

            // 💥 ARCADE EFFECT
            ctx.shadowColor = "red";
            ctx.shadowBlur = 25;

            let flicker = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;

            ctx.globalAlpha = flicker;

            ctx.fillStyle = "#ff0033";
            ctx.font = "bold 60px Arial";
            ctx.fillText("GAME OVER", w / 2, 250);

            // sub text
            ctx.shadowBlur = 10;
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Press R to Restart", w / 2, 300);

            ctx.restore();
        }

        // 🏆 ARCADE WIN SCREEN
        if (this.win) {
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, w, ctx.canvas.height);

            ctx.save();

            ctx.translate(w / 2, ctx.canvas.height / 2);

            let scale = 1 + Math.sin(Date.now() * 0.002) * 0.05;
            ctx.scale(scale, scale);

            ctx.textAlign = "center";

            ctx.fillStyle = "white";
            ctx.font = "60px Arial";
            ctx.fillText("YOU WIN!", 0, -40);

            ctx.font = "22px Arial";
            ctx.fillText("Score: " + this.score, 0, 10);

            ctx.font = "18px Arial";
            ctx.fillText("Press R to Restart", 0, 50);

            ctx.restore();
        }
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.win = false;
        this.gameOver = false;
        this.floatTexts = [];
    }
}