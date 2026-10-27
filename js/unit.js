/*
 * Unit stat definitions.
 * These define all the buildable unit types in the game.
 */
function unitStats(name, maxHealth, speed, range, damage, attackSpeed, spriteup, spritedown, icon, price, miner) {
    this.name = name;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.range = range;
    this.damage = damage;
    this.attackSpeed = attackSpeed;
    this.spriteup = spriteup;
    this.spritedown = spritedown;
    this.icon = icon;
    this.price = price;
    this.miner = miner;
}

// Misc
const hq = new unitStats("HQ", 200, 0, 1, 0, 0, "art/orangehq01small.png", "art/orangehq01small.png", "art/orangehq01small.png", 0, false);

// Tier 1
const speeder = new unitStats("Speeder", 10, 1.2, 150, 2, 25, "art/racerb.png", "art/racera.png", "art/racericon.png", 200, false);
const lighttank = new unitStats("Light Tank", 25, 1, 200, 5, 50, "art/speeder1b.png", "art/speeder1a.png", "art/speeder1icon.png", 300, false);

// Tier 2
const miner = new unitStats("Miner", 50, 0.5, 225, 10, 80, "art/minerb.png", "art/minera.png", "art/minericon.png", 600, true);
const medtank = new unitStats("Medium Tank", 50, 0.5, 225, 10, 80, "art/tankb.png", "art/tanka.png", "art/tankicon.png", 600, false);

// Tier 3
const heavytank = new unitStats("Heavy Tank", 75, 0.4, 225, 30, 100, "art/heavyb.png", "art/heavya.png", "art/heavyicon.png", 1200, false);
const gunship = new unitStats("Gunship", 40, 0.8, 225, 20, 40, "art/speeder4b.png", "art/speeder4a.png", "art/speeder4icon.png", 1500, false);

// Static variant for base defence
const gunshipstatic = new unitStats("Gunship", 40, 0.001, 225, 20, 40, "art/speeder4b.png", "art/speeder4a.png", "art/speeder4icon.png", 1500, false);

/*
 * Unit class template.
 * Each unit is a combat entity with stats, position, and behaviour.
 */
function unit(spriteup, spritedown) {
    this.stats = {
        maxHealth: 100,
        health: 100,
        speed: 1,
        range: 200,
        damage: 10,
        attackSpeed: 30
    };

    this.position = {
        x: 0,
        y: 0,
        id: -1
    };

    this.miner = {
        payload: 0,
        maxPayload: 1500
    };

    this.target = 0;
    this.attackCooldown = 0;
    this.isEnemy = true;
    this.stopped = true;
    this.timer = 0;

    this.spriteup = spriteup;
    this.spritedown = spritedown;

    /* ---- Main functions ---- */

    this.movement = () => {
        if (!this.stopped) {
            // Goes up if friendly, and vice versa
            this.position.y += this.stats.speed * 2 * (this.isEnemy - 0.5);
        }
    };

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

            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
        }
    };

    this.render = () => {
        let renderx = this.position.x;
        let rendery = this.position.y;
        if (this.stats.speed > 0) {
            renderx += (Math.sin(this.timer / 30) * 5);
            rendery += (Math.cos(this.timer / 10) * -2);
        }

        // Shadow
        ctx.drawImage(shadow, renderx - (this.spritedown.width / 2), rendery - camera - ((this.spriteup.height * 0.75) / 2) + 20, this.spriteup.width, this.spriteup.height * 0.75);

        if (this.isMouseOver() && !this.isEnemy) {
            ctx.filter += " brightness(150%)";

            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y - camera, this.stats.range, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.isEnemy) {
            ctx.filter += " hue-rotate(180deg)";
            ctx.drawImage(this.spritedown, renderx - (this.spritedown.width / 2), rendery - (this.spritedown.height / 2) - camera);
        } else {
            ctx.filter += " hue-rotate(" + teamHueShift + "deg)";
            ctx.drawImage(this.spriteup, renderx - (this.spriteup.width / 2), rendery - (this.spriteup.height / 2) - camera);
        }

        ctx.filter = "hue-rotate(0deg)";
        drawHealthBar(this.position.x, this.position.y - (this.spriteup.height / 2) - 5 - camera, this.stats.health, this.stats.maxHealth);
    };

    this.death = () => {
        if (this.isEnemy) {
            score.points += this.stats.maxHealth;
        }

        if (this.position.id === 0) {
            // Kill all friendly units
            for (const [key, value] of unitMap.entries()) {
                if (!value.isEnemy && value.position.id !== 0) {
                    value.death();
                }
            }
        } else if (this.position.id === 1) {
            // Kill all enemy units
            for (const [key, value] of unitMap.entries()) {
                if (value.isEnemy && value.position.id !== 1) {
                    value.death();
                }
            }
            calculateScore();
        }
        playSound("sfx/explode.wav", 0.1);
        createVFX(this.position.x, this.position.y, "debris");
        createVFX(this.position.x, this.position.y, "expl");
        unitMap.delete(this.position.id);
    };

    this.logic = () => {
        if (this.stats.health <= 0) {
            this.death();
        }

        // Acquire nearest enemy target
        let closestDistance = Infinity;

        for (const [key, value] of unitMap) {
            let compareDistance = pythag(this.position.x, value.position.x, this.position.y, value.position.y);
            if (value.isEnemy !== this.isEnemy && compareDistance < closestDistance) {
                closestDistance = compareDistance;
                this.target = key;
            }
        }

        if (closestDistance < this.stats.range) {
            this.attack();
        } else {
            this.movement();
        }
        this.attackCooldown--;
        this.timer++;

        if (this.isMouseOver() && mbutton === 0 && !this.isEnemy) {
            this.stopped = !this.stopped;
            playSound("sfx/impactMetal_002.ogg", 0.2);
        }
    };

    this.hurt = (damage) => {
        this.stats.health -= damage;
    };

    this.heal = (healing) => {
        this.stats.health += healing;
    };

    this.isMouseOver = () => {
        return pythag(this.position.x, mxg, this.position.y, myg) < (this.spriteup.height / 2);
    };

    /* ---- Miner-specific functions ---- */

    this.minerMovement = () => {
        if (this.miner.payload < this.miner.maxPayload) {
            this.position.y += this.stats.speed * 2 * (this.isEnemy - 0.5) * (1 - this.stopped);
        } else {
            this.position.y -= this.stats.speed * 2 * (this.isEnemy - 0.5) * (1 - this.stopped);
        }
    };

    this.minerLogic = () => {
        if (this.stats.health <= 0) {
            this.death();
        }

        // Acquire nearest crystal
        let closestDistance = Infinity;

        for (let i = 0; i < crystals.length; i++) {
            let compareDistance = pythag(this.position.x, crystals[i].position.x, this.position.y, crystals[i].position.y);
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

        if (this.isMouseOver() && mbutton === 0 && !this.isEnemy) {
            this.stopped = !this.stopped;
            playSound("sfx/impactMetal_002.ogg", 0.2);
        }
    };

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

            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
        }
    };
}

/*
 * Unit creation factory — applies stats from a unitStats definition.
 */
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

    if (stats.miner) {
        newUnit.logic = newUnit.minerLogic;
        newUnit.movement = newUnit.minerMovement;
    }

    newUnit.position.id = unitID++;
    unitMap.set(newUnit.position.id, newUnit);
}