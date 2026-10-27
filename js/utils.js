// Calculates distance between two points
function pythag(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// Plays a sound effect
function playSound(path, volume) {
    let sound = new Audio(path);
    sound.volume = volume;
    sound.play();
}

// Draws a health bar above an entity
function drawHealthBar(x, y, health, maxHealth) {
    ctx.fillStyle = "#00ff84";
    ctx.fillRect(x - (maxHealth / 2), y, health, 5);
}

// Sets the canvas font style
function getFont() {
    ctx.font = "30px monospace";
    ctx.fillStyle = "#ececec";
}