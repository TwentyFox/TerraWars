/*
 * Crystal resource node.
 * Miners collect from these to generate income.
 */
function crystal(sprite) {
    this.value = 10000;
    this.position = {
        x: 0,
        y: 0
    };
    this.id = 0;
    this.sprite = sprite;

    this.render = () => {
        ctx.drawImage(shadow, this.position.x - (this.sprite.width / 2), this.position.y - camera - ((this.sprite.height * 0.75) / 2) + 10, this.sprite.width, this.sprite.height * 0.75);

        if (this.value <= 0) {
            ctx.filter = "brightness(50%)";
        }
        ctx.drawImage(sprite, this.position.x - (this.sprite.width / 2), this.position.y - (this.sprite.height / 2) - camera);
        ctx.filter = "hue-rotate(90deg) brightness(100%)";
        drawHealthBar(this.position.x, this.position.y - 50 - camera, this.value / 50, 10000 / 50);
        ctx.filter = "hue-rotate(0deg)";
    };
}