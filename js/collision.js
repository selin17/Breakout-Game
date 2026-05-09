export function circleRectCollision(ball, rect) {
    return (
        ball.x + ball.radius > rect.x &&
        ball.x - ball.radius < rect.x + rect.width &&
        ball.y + ball.radius > rect.y &&
        ball.y - ball.radius < rect.y + rect.height
    );
}