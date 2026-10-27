/*
 * UI class — renders the HUD, build tooltips, and win/lose overlays.
 */
function UI() {
    this.render = () => {
        ctx.fillStyle = "rgba(37,32,32,0.8)";
        ctx.fillRect(0, cvs.height - 96, cvs.width, 96); // Big lower box
        ctx.fillRect(10, cvs.height - 128, 200, 32);
        ctx.fillRect(390, cvs.height - 128, 200, 32);

        for (let i = 0; i < 6; i++) {
            let u = friendlyTeam.unitSelection[i];
            let img = new Image();
            img.src = u.icon;
            ctx.drawImage(img, i * 96, cvs.height - 120, 128, 128);

            if (this.isMouseOver(i * 96 + 48, cvs.height - 48)) {
                getFont();
                ctx.fillText(friendlyTeam.unitSelection[i].name + " $" + friendlyTeam.unitSelection[i].price, mx / 2, my);
            }
        }

        getFont();
        ctx.fillText("$" + friendlyTeam.money, 16, 700);
        ctx.fillText(Math.trunc((score.timer / 60)) + " secs", 396, 700);
    };

    this.isMouseOver = (x, y) => {
        return pythag(x, mx, y, my) < 48;
    };

    this.drawWinScreen = () => {
        ctx.fillStyle = "rgba(37,32,32,0.8)";
        ctx.fillRect(100, 200, 400, 200);
        getFont();
        ctx.fillText("Sector Conquered", 128, 256);
        ctx.fillText("Time Taken: " + Math.trunc((score.timer / 60)), 128, 288);
        ctx.fillText("Score: " + score.points, 128, 320);
        ctx.fillText("Refresh to replay", 128, 360);
    };

    this.drawLoseScreen = () => {
        ctx.fillStyle = "rgba(37,32,32,0.8)";
        ctx.fillRect(100, 200, 400, 200);
        getFont();
        ctx.fillText("Mission Failed", 128, 256);
        ctx.fillText("Time Taken: " + Math.trunc((score.timer / 60)), 128, 288);
        ctx.fillText("Refresh to replay", 128, 360);
    };
}