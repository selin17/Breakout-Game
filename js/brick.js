export default class Brick {
    constructor(x, y, width, height, hp = 1) {
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.hp = hp;
        this.active = true;
    }

    hit() {
        this.hp--;

        if (this.hp <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.hp === 2 ? "orange" : "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}