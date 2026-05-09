export default class Ball {
    constructor(canvas) {
        this.canvas = canvas;

        this.radius = 10;

        this.startX = canvas.width / 2;
        this.startY = canvas.height / 2;

        this.x = this.startX;
        this.y = this.startY;

        this.dx = 4;
        this.dy = -4;

        this.speedMultiplier = 1;
    }

    move(paddle) {
        this.x += this.dx * this.speedMultiplier;
        this.y += this.dy * this.speedMultiplier;

        if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
            this.dx *= -1;
        }

        if (this.y - this.radius < 0) {
            this.dy *= -1;
        }

        if (
            this.y + this.radius >= paddle.y &&
            this.x >= paddle.x &&
            this.x <= paddle.x + paddle.width &&
            this.dy > 0
        ) {
            this.dy *= -1;
            this.y = paddle.y - this.radius;

            let hitPoint = this.x - (paddle.x + paddle.width / 2);
            this.dx = hitPoint * 0.15;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;

        this.dx = 4;
        this.dy = -4;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }
}