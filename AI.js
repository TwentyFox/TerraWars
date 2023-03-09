function AI() {
    this.timer = 0;

    this.spawnLogic = [0,0,1,0,1,1,2,1,3,4,0,0,3,0,4,3,1,2,5,1,0,0,5,3,3];

    this.assault = () => {
        if ((this.timer % 900) === 0) {
            for (const [key, value] of unitMap.entries()) {
                if (value.isEnemy) {
                    value.stopped = false;
                }
            }
        }
        if ((this.timer % 300) === 0) {
            if (this.timer / 300 >= this.spawnLogic.length) {
                this.spawnLogic.push(this.rnd(0,6));
            }
            createUnit(enemyTeam.unitSelection[this.spawnLogic[this.timer / 300]], this.rnd(150,450), unitMap.get(1).position.y + 100, true);
        }

        this.timer++;
    }

    //https://www.w3schools.com/js/js_random.asp
    this.rnd = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min
    }
}