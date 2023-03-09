//Program variables
let cvs = document.getElementById("cvs");
let ctx = cvs.getContext("2d");

let splash = new Image();
splash.src = "art/terrawars.png";
splash.onload = () => {
    ctx.drawImage(splash, 0, 0);
}


let score = { //Data for the server
    timer: 0,
    points: 0
}
let teamHueShift = 0;

function setTeamHueShift(val) {
    teamHueShift = val;
}

//Game variables
let unitMap = new Map(); //Stores all units in the game
let unitID = 0;

let crystals = [];

let vfxMap = new Map();
let vfxID = 0;

let shadow = new Image();
shadow.src = "art/Shadow.png"

let camera = 0;

let d = new Date();

/*
CORE FUNCTIONS BELOW
 */

//Handles Keyboard inputs
let keyCode;
//Taken from Workshop 4 slides
document.onkeydown = (event) => {
    keyCode = event.key;
    if (keyCode == "ArrowUp" || keyCode == "ArrowDown") {
        event.preventDefault();
    }
    console.log(keyCode);
}

//Handles mouse movements
let mx = 0;
let my = 0;
let myg = 0;
let mxg = 0;
cvs.onmousemove = (event) => {
    mx = event.offsetX;
    my = event.offsetY;

    //Relates to camera position
    myg = event.offsetY + camera;
    mxg = event.offsetX;
}

//Handles mouse inputs
let mbutton = "none";
cvs.onmousedown = (event) => {
    mbutton = event.button;
    console.log(mbutton);
}

/*
GAME FUNCTIONS BELOW
*/
let enemy; //Used for the AI

//Renders the UI above the game
let ui;
function UI() {
    this.render = () => {
        ctx.fillStyle = "rgba(37,32,32,0.8)";
        ctx.fillRect(0, cvs.height - 96, cvs.width, 96); //Big lower box
        ctx.fillRect(10, cvs.height - 128, 200, 32);
        ctx.fillRect(390, cvs.height - 128, 200, 32);

        for(let i = 0; i < 6; i++) {
            let u = friendlyTeam.unitSelection[i];
            let img = new Image();
            img.src = u.icon;
            ctx.drawImage(img, i * 96, cvs.height - 120, 128, 128);

            if (this.isMouseOver(i * 96 + 48, cvs.height - 48)) {
                getFont();
                ctx.fillText( friendlyTeam.unitSelection[i].name + " $" + friendlyTeam.unitSelection[i].price, mx / 2, my);
            }
        }

        getFont();
        ctx.fillText("$" + friendlyTeam.money, 16, 700);
        ctx.fillText(Math.trunc((score.timer / 60)) + " secs", 396, 700);
    }
    this.isMouseOver = (x, y) => {
        return pythag(x, mx, y, my) < 48;

    }
    this.drawWinScreen = () => {
        ctx.fillStyle = "rgba(37,32,32,0.8)";
        ctx.fillRect(100, 200, 400,200);
        getFont();
        ctx.fillText("Sector Conquered", 128, 256);
        ctx.fillText("Time Taken: " + Math.trunc((score.timer / 60)), 128, 288);
        ctx.fillText("Score: " + score.points, 128, 320);
        ctx.fillText("Refresh to replay", 128,360);
    }
    this.drawLoseScreen = () => {
        ctx.fillStyle = "rgba(37,32,32,0.8)";
        ctx.fillRect(100, 200, 400,200);
        getFont();
        ctx.fillText("Mission Failed", 128, 256);
        ctx.fillText("Time Taken: " + Math.trunc((score.timer / 60)), 128, 288);
        ctx.fillText("Refresh to replay", 128,360);
    }
}

//Team Classes
let friendlyTeam;
let enemyTeam;
function team(isEnemy, u1, u2, u3, u4, u5, u6) {
    this.unitSelection = [u1, u2, u3, u4, u5, u6];
    this.isEnemy = isEnemy;
    this.money = 2000;

    this.isBuilding = -1;

    this.build = (u) => {
        if (this.money >= this.unitSelection[u].price) {
            createUnit(this.unitSelection[u], mxg, myg, this.isEnemy)
            this.money -= this.unitSelection[u].price;
        }
    }

    this.toggleBuild = (u) => {
        if (this.isBuilding == -1) {
            this.isBuilding = u;
        } else {
            this.isBuilding = -1;
        }
    }

    this.logic = () => {
        if (this.isBuilding != -1) {
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
            ctx.drawImage(img,mx - (img.width / 2), my - (img.height / 2));

            ctx.filter = "opacity(100%)"; //resets filter

            if (mbutton == 0) {
                this.build(this.isBuilding);
                this.isBuilding = -1;
            } else if (mbutton == 2) {
                this.isBuilding = -1;
            }
        }
    }
}

//Unit class template
function unit(spriteup, spritedown) {
    this.stats = {
        maxHealth : 100,
        health : 100,
        speed : 1,
        range : 200,
        damage : 10,
        attackSpeed : 30
    };

    this.position = {
        x : 0,
        y : 0,
        id : -1
    };

    this.miner = {
        payload: 0,
        maxPayload: 1500,
    }

    this.target = 0;
    this.attackCooldown = 0;

    this.isEnemy = true;

    this.stopped = true;

    this.timer = 0;

    this.spriteup = spriteup;
    this.spritedown = spritedown;

    //Main functions
    this.movement = () => {
        if (!this.stopped) {
            this.position.y += this.stats.speed * 2 * (this.isEnemy - 0.5); // Goes up if friendly, and vise versa
        }
    }

    this.attack = () => {
        if (this.attackCooldown <= 0) {
            unitMap.get(this.target).hurt(this.stats.damage);
            this.attackCooldown = this.stats.attackSpeed;
            playSound("sfx/laserSmall_000.ogg", 0.1);

            if (!this.isEnemy) {
                ctx.strokeStyle = "#ffdd00";
            } else {
                ctx.strokeStyle = "#00ffd0";
            }
            ctx.lineWidth = this.stats.damage / 3;

            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y - camera);
            ctx.lineTo(unitMap.get(this.target).position.x, unitMap.get(this.target).position.y - camera);
            ctx.stroke();

            ctx.lineWidth = 1; //resets the line width
            ctx.strokeStyle = "black" //resets the stroke style
        }
    }

    this.render = () => {
        let renderx = this.position.x;
        let rendery = this.position.y;
        if (this.stats.speed > 0) {
            renderx += (Math.sin(this.timer / 30) * 5);
            rendery += (Math.cos(this.timer / 10) * -2);
        }

        //Shadow
        ctx.drawImage(shadow, renderx - (this.spritedown.width / 2) , rendery - camera - ((this.spriteup.height * 0.75) / 2) + 20, this.spriteup.width, this.spriteup.height * 0.75);

        if ( this.isMouseOver() && !this.isEnemy) { //Mouse hover highlights
            ctx.filter += " brightness(150%)";

            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y - camera, this.stats.range, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.isEnemy) {
            ctx.filter += " hue-rotate(180deg)";
            ctx.drawImage(this.spritedown, renderx - (this.spritedown.width / 2), rendery - (this.spritedown.height / 2) - camera); // Draws the image
        } else {
            ctx.filter += " hue-rotate(" + teamHueShift + "deg)";
            ctx.drawImage(this.spriteup, renderx - (this.spriteup.width / 2), rendery - (this.spriteup.height / 2) - camera); // Draws the image
        }

        ctx.filter = "hue-rotate(0deg)" // RESETS FILTER
        drawHealthBar(this.position.x,this.position.y - (this.spriteup.height / 2) - 5 - camera,this.stats.health,this.stats.maxHealth); // Draws the healthbar
    }

    this.death = () => {
        if (this.isEnemy) {
            score.points += this.stats.maxHealth;
        }

        if (this.position.id === 0) { //Kills all units of the same team
            for (const [key, value] of unitMap.entries()) {
                if (!value.isEnemy && value.position.id !== 0) {
                    value.death();
                }
            }
        } else if (this.position.id === 1) {
            for (const [key, value] of unitMap.entries()) {
                if (value.isEnemy && value.position.id !== 1) {
                    value.death();
                }
            }
            calculateScore();
        }
        playSound("sfx/explode.wav", 0.1);
        createVFX(this.position.x, this.position.y, "debris");
        createVFX(this.position.x, this.position.y,"expl");
        unitMap.delete(this.position.id);
    }

    this.logic = () => {
        if (this.stats.health <= 0) {
            this.death();
        }

        //acquire target
        let closestDistance = Infinity;

        for (const [key, value] of unitMap) {
            let compareDistance = pythag(this.position.x,value.position.x,this.position.y,value.position.y);
            if (value.isEnemy !== this.isEnemy && compareDistance < closestDistance) {
                closestDistance = compareDistance;
                this.target = key;
            }
        }
        //let t = unitMap.get(this.target);
        if (closestDistance < this.stats.range) {
            this.attack();
        } else {
            this.movement();
        }
        this.attackCooldown--;
        this.timer++;

        if (this.isMouseOver() && mbutton == "0" && !this.isEnemy) {
            this.stopped = ! this.stopped;
            playSound("sfx/impactMetal_002.ogg",0.2);
        }
    }

    this.hurt = (damage) => {
        this.stats.health -= damage;
        //console.log(this.stats.health);
    }

    this.heal = (healing) => {
        this.stats.health += healing;
    }

    this.isMouseOver = () => {
        return pythag(this.position.x, mxg, this.position.y, myg) < (this.spriteup.height / 2);

    }

    this.minerMovement = () => {
        if (this.miner.payload < this.miner.maxPayload) {
            this.position.y += this.stats.speed * 2 * (this.isEnemy - 0.5) * (1 - this.stopped); // Goes up if friendly, and vise versa
        } else {
            this.position.y -= this.stats.speed * 2 * (this.isEnemy - 0.5) * (1 - this.stopped);
        }
    }

    this.minerLogic = () => {
        if (this.stats.health <= 0) {
            this.death();
        }

        //acquire target
        let closestDistance = Infinity;

        for (let i = 0; i < crystals.length; i++) {
            let compareDistance = pythag(this.position.x,crystals[i].position.x,this.position.y,crystals[i].position.y);
            if (crystals[i].value > 0 && compareDistance < closestDistance) {
                closestDistance = compareDistance;
                this.target = crystals[i].id;
            }
        }
        if (closestDistance < this.stats.range && this.miner.payload < this.miner.maxPayload) {
            this.mine();
        } else {
            this.movement();
            if (!this.isEnemy && this.position.y > unitMap.get(0).position.y) {
                friendlyTeam.money += this.miner.payload;
                this.miner.payload = 0;
            } else if (this.isEnemy && this.position.y < unitMap.get(1).position.y) {
                enemyTeam.money += this.miner.payload;
                this.miner.payload = 0;
            }
        }
        this.attackCooldown--;
        this.timer++;

        if (this.isMouseOver() && mbutton == "0" && !this.isEnemy) {
            this.stopped = ! this.stopped;
            playSound("sfx/impactMetal_002.ogg",0.2);
        }
    }

    this.mine = () => {
        if (this.attackCooldown <= 0) {
            crystals[this.target].value -= 100;
            this.miner.payload += 100;

            this.attackCooldown = this.stats.attackSpeed;
            playSound("sfx/laserLarge_001.ogg", 0.1);
            ctx.strokeStyle = "#8cff00";

            ctx.lineWidth = 5;

            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y - camera);
            ctx.lineTo(crystals[this.target].position.x, crystals[this.target].position.y - camera);
            ctx.stroke();

            //console.log("MINE: " + this.miner.payload);
            //console.log("TARGET: " + this.target);

            ctx.lineWidth = 1; //resets the line width
            ctx.strokeStyle = "black" //resets the stroke style
        }
    }
}

//Unit creation... essentially the constructor
function createUnit(stats, x, y, isEnemy) {
    let imgup = new Image();
    let imgdown = new Image();
    imgup.src = stats.spriteup;
    imgdown.src = stats.spritedown;
    let newUnit = new unit(imgup, imgdown);

    newUnit.position.x = x;
    newUnit.position.y = y;
    newUnit.isEnemy = isEnemy;

    newUnit.stats.maxHealth = stats.maxHealth;
    newUnit.stats.health = stats.maxHealth;
    newUnit.stats.speed = stats.speed;
    newUnit.stats.range = stats.range;
    newUnit.stats.damage = stats.damage;
    newUnit.stats.attackSpeed = stats.attackSpeed;
    newUnit.price = stats.price;

    if (stats.miner) {
        newUnit.logic = newUnit.minerLogic;
        newUnit.movement = newUnit.minerMovement;
    }

    newUnit.position.id = unitID++;
    unitMap.set(newUnit.position.id,newUnit);
}

function crystal(sprite) {
    this.value = 10000;
    this.position = {
        x : 0,
        y : 0
    }
    this.id = 0;
    this.sprite = sprite;

    this.render = () => {
        ctx.drawImage(shadow, this.position.x - (this.sprite.width / 2) , this.position.y - camera - ((this.sprite.height * 0.75) / 2) + 10, this.sprite.width, this.sprite.height * 0.75);

        if (this.value <= 0) {
            ctx.filter = "brightness(50%)"
        }
        ctx.drawImage(sprite, this.position.x - (this.sprite.width / 2), this.position.y - (this.sprite.height / 2) - camera);
        ctx.filter = "hue-rotate(90deg) brightness(100%)";
        drawHealthBar(this.position.x, this.position.y - 50 - camera, this.value / 50, 10000 / 50);
        ctx.filter = "hue-rotate(0deg)";
    }
}

//Draws a healthbar
function drawHealthBar(x, y, health, maxHealth) {
    ctx.fillStyle = "#00ff84";
    ctx.fillRect(x - (maxHealth / 2), y, health, 5);
    //console.log((health / maxHealth) * 100.0)
}

function getFont() {
    ctx.font = "30px monospace"
    ctx.fillStyle = "#ececec";
}

//Calculates distance
function pythag(x1,x2,y1,y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function playSound(path, volume) {
    let sound = new Audio(path);
    sound.volume = volume;
    sound.play();
}

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
            ctx.drawImage(sprite, this.timer * this.sprite.height, 0, this.sprite.height, this.sprite.height, this.x - (this.sprite.height / 2), this.y - (this.sprite.height / 2) - camera, this.sprite.height, this.sprite.height)
        } else {
            ctx.filter = "opacity(" + ((this.frames - this.timer)/this.frames) + ")";
            ctx.drawImage(sprite, this.x - (this.sprite.height / 2), this.y - (this.sprite.height / 2) - camera);
            ctx.filter = "opacity(100%)"
        }
        this.timer++;
    }
}

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
            img.src = "art/testSprite.png";
    }
    let effect = new vfx(x, y, vfxID, img, frames, isAnimated);
    vfxMap.set(vfxID++,effect);
}

//Is called when the game starts
function start() {
    document.getElementById("startButton").disabled = true;

    ui = new UI();

    friendlyTeam = new team(false, speeder, lighttank, miner, medtank, heavytank, gunship);
    enemyTeam = new team(true, speeder, lighttank, miner, medtank, heavytank, gunship);

    //create bases

    createUnit(hq, 300, 1200, false);
    createUnit(hq, 300, 0, true);

    createUnit(gunshipstatic,200, 200,true);
    createUnit(gunshipstatic,400, 200,true);

    camera = 600; //Sets the camera to the base.

    enemy = new AI();

    let img = new Image();
    img.src = "art/crystals.png"
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

    //17ms frame delay equates to roughly 60fps
    setInterval(main, 17);
}

//is called at around 60fps
function main() {
    if (unitMap.get(0) == undefined) {
        render();
        ui.drawLoseScreen();
        return;
    }
    if (unitMap.get(1) == undefined) {
        render();
        ui.drawWinScreen();
        return;
    }

    //Testing for inputs
    if (keyCode != "noCode") {
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
        keyCode = "noCode"
    }

    enemy.assault();

    render();

    mbutton = "none"; //Resets mouse button

    score.timer++;
}

function render() {
    //Clears the screen
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = "#88432e";
    ctx.fillRect(0,0, 600, 800);

    //Renders VFX
    for (const [key, value] of vfxMap.entries()) {
        value.render();
    }

    //Renders every crystal
    for (let i = 0; i < crystals.length; i++) {
        crystals[i].render();
    }

    //Renders every unit
    for (const [key, value] of unitMap.entries()) {
        value.logic();
        value.render();
    }

    //Team logic
    friendlyTeam.logic();

    //Render UI
    ui.render();
}

function calculateScore() {
    score.points += 2500 - ( Math.trunc((score.timer / 60)) * 5 );
    document.getElementById("score").value = score.points;
    document.getElementById("time").value = Math.trunc((score.timer / 60));
    document.getElementById("submitButton").disabled = false;
}