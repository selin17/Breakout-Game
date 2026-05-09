export default class Paddle {
    constructor(canvas) {
        this.canvas = canvas;

        this.width = 120;
        this.height = 20;

        this.x = (canvas.width - this.width) / 2;
        this.y = canvas.height - 40;

        this.speed = 8;
        this.dx = 0;
    }

    move() {
        this.x += this.dx;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}