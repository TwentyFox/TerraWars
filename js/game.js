/*
 * Game loop — manages start, main update, rendering, and scoring.
 */

// Called when the game starts
function start() {
    document.getElementById("startButton").disabled = true;

    ui = new UI();

    friendlyTeam = new team(false, speeder, lighttank, miner, medtank, heavytank, gunship);
    enemyTeam = new team(true, speeder, lighttank, miner, medtank, heavytank, gunship);

    // Create bases
    createUnit(hq, 300, 1200, false);
    createUnit(hq, 300, 0, true);

    // Static defence gunships near the enemy base
    createUnit(gunshipstatic, 200, 200, true);
    createUnit(gunshipstatic, 400, 200, true);

    camera = 600;

    enemy = new AI();

    // Create crystal resource nodes
    let img = new Image();
    img.src = "art/crystals.png";

    let cry = new crystal(img);
    cry.position.x = 100;
    cry.position.y = 400;
    cry.id = 0;
    crystals[0] = cry;

    let cry2 = new crystal(img);
    cry2.position.x = 100;
    cry2.position.y = 800;
    cry2.id = 1;
    crystals[1] = cry2;

    let cry3 = new crystal(img);
    cry3.position.x = 500;
    cry3.position.y = 600;
    cry3.id = 2;
    crystals[2] = cry3;

    playSound("sfx/12_final_battle.ogg", 0.1);

    // 17ms frame delay ≈ 60fps
    setInterval(main, 17);
}

// Called at approximately 60fps
function main() {
    if (unitMap.get(0) === undefined) {
        render();
        ui.drawLoseScreen();
        return;
    }
    if (unitMap.get(1) === undefined) {
        render();
        ui.drawWinScreen();
        return;
    }

    // Process keyboard input
    if (keyCode !== "noCode") {
        switch (keyCode) {
            case "1":
                friendlyTeam.toggleBuild(0);
                break;
            case "2":
                friendlyTeam.toggleBuild(1);
                break;
            case "3":
                friendlyTeam.toggleBuild(2);
                break;
            case "4":
                friendlyTeam.toggleBuild(3);
                break;
            case "5":
                friendlyTeam.toggleBuild(4);
                break;
            case "6":
                friendlyTeam.toggleBuild(5);
                break;
            case "ArrowDown":
                camera += 50;
                break;
            case "ArrowUp":
                camera -= 50;
                break;
        }
        keyCode = "noCode";
    }

    enemy.assault();

    render();

    mbutton = null;

    score.timer++;
}

function render() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = "#88432e";
    ctx.fillRect(0, 0, 600, 800);

    // Render VFX
    for (const [key, value] of vfxMap.entries()) {
        value.render();
    }

    // Render crystals
    for (let i = 0; i < crystals.length; i++) {
        crystals[i].render();
    }

    // Render units (logic + draw)
    for (const [key, value] of unitMap.entries()) {
        value.logic();
        value.render();
    }

    // Team build placement logic
    friendlyTeam.logic();

    // Render UI
    ui.render();
}

// Called when the enemy HQ is destroyed
function calculateScore() {
    score.points += 2500 - (Math.trunc((score.timer / 60)) * 5);
}