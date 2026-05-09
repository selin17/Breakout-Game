import Game from "./game.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const game = new Game(canvas, ctx);

document.addEventListener("keydown", (e) => {
    // SPACE CONTROL
    if (e.code === "Space") {
        if (game.state === "menu") {
            game.started = true;
            game.state = "playing";
        } else if (game.state === "levelcomplete") {
            game.level++;
            game.setLevel(game.level);
            game.state = "playing";
        }
    }

    // MOVE LEFT
    if (e.key === "ArrowLeft") game.paddle.dx = -game.paddle.speed;

    // MOVE RIGHT
    if (e.key === "ArrowRight") game.paddle.dx = game.paddle.speed;

    // RESTART
    if (e.key.toLowerCase() === "r") {
        game.restart();
    }

    // PAUSE
    if (e.key === "Escape") {
        if (game.state === "playing" || game.state === "paused") {
            game.paused = !game.paused;
        }
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") game.paddle.dx = 0;
});

game.start();