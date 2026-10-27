/*
 * Team class — manages unit selection, economy, and building placement.
 */
function team(isEnemy, u1, u2, u3, u4, u5, u6) {
    this.unitSelection = [u1, u2, u3, u4, u5, u6];
    this.isEnemy = isEnemy;
    this.money = 2000;
    this.isBuilding = -1;

    this.build = (u) => {
        if (this.money >= this.unitSelection[u].price) {
            createUnit(this.unitSelection[u], mxg, myg, this.isEnemy);
            this.money -= this.unitSelection[u].price;
        }
    };

    this.toggleBuild = (u) => {
        if (this.isBuilding === -1) {
            this.isBuilding = u;
        } else {
            this.isBuilding = -1;
        }
    };

    this.logic = () => {
        if (this.isBuilding !== -1) {
            ctx.beginPath();
            ctx.moveTo(0, unitMap.get(0).position.y - 300 - camera);
            ctx.lineTo(600, unitMap.get(0).position.y - 300 - camera);
            ctx.stroke();

            ctx.filter = "opacity(50%)";

            if (this.money >= this.unitSelection[this.isBuilding].price && myg > (unitMap.get(0).position.y - 300)) {
                ctx.fillStyle = "#00ff3c";
            } else {
                ctx.fillStyle = "red";
            }

            ctx.beginPath();
            ctx.arc(mx, my, this.unitSelection[this.isBuilding].range, 0, Math.PI * 2);
            ctx.fill();

            let img = new Image();
            img.src = this.unitSelection[this.isBuilding].spriteup;
            ctx.drawImage(img, mx - (img.width / 2), my - (img.height / 2));

            ctx.filter = "opacity(100%)";

            if (mbutton === 0) {
                this.build(this.isBuilding);
                this.isBuilding = -1;
            } else if (mbutton === 2) {
                this.isBuilding = -1;
            }
        }
    };
}