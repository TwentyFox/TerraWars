/*
 * Visual effects system — handles explosions and debris.
 */
function vfx(x, y, ID, sprite, frames, isAnimated) {
    this.sprite = sprite;
    this.timer = 0;
    this.x = x;
    this.y = y;
    this.ID = ID;
    this.frames = frames;
    this.isAnimated = isAnimated;

    this.render = () => {
        if (this.timer >= this.frames) {
            vfxMap.delete(this.ID);
        }
        if (this.isAnimated) {
            ctx.drawImage(sprite, this.timer * this.sprite.height, 0, this.sprite.height, this.sprite.height, this.x - (this.sprite.height / 2), this.y - (this.sprite.height / 2) - camera, this.sprite.height, this.sprite.height);
        } else {
            ctx.filter = "opacity(" + ((this.frames - this.timer) / this.frames) + ")";
            ctx.drawImage(sprite, this.x - (this.sprite.height / 2), this.y - (this.sprite.height / 2) - camera);
            ctx.filter = "opacity(100%)";
        }
        this.timer++;
    };
}

/*
 * Factory function for spawning visual effects.
 */
function createVFX(x, y, type) {
    let img = new Image();
    let isAnimated = false;
    let frames = 1;

    switch (type) {
        case "expl":
            img.src = "art/Explosion.png";
            isAnimated = true;
            frames = 12;
            break;
        case "debris":
            img.src = "art/debris.png";
            isAnimated = false;
            frames = 600;
            break;
        default:
            img.src = "art/TestSprite.png";
    }

    let effect = new vfx(x, y, vfxID, img, frames, isAnimated);
    vfxMap.set(vfxID++, effect);
}