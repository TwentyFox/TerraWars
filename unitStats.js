function unitStats(name, maxHealth,speed,range,damage,attackSpeed,spriteup,spritedown,icon,price,miner) {
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

//misc
var hq = new unitStats("HQ",200,0,1,0,0,"art/orangehq01small.png","art/orangehq01small.png","art/orangehq01small.png",0, false); //the main base

//buildables


//tier 1
var speeder = new unitStats("Speeder",10, 1.2, 150, 2, 25, "art/racerb.png", "art/racera.png", "art/racericon.png",200,false); //Light tank
var lighttank = new unitStats("Light Tank",25, 1, 200, 5, 50, "art/speeder1b.png", "art/speeder1a.png", "art/speeder1icon.png",300, false); //Light tank

//tier 2
var miner = new unitStats("Miner",50, 0.5,225,10,80,"art/minerb.png","art/minera.png", "art/minericon.png",600, true); //Miner
var medtank = new unitStats("Medium Tank",50, 0.5,225,10,80,"art/tankb.png","art/tanka.png", "art/tankicon.png", 600, false); //Medium tank

//Tier 3
var heavytank = new unitStats("Heavy Tank",75, 0.4, 225, 30, 100, "art/heavyb.png", "art/heavya.png", "art/heavyicon.png", 1200, false); //Heavy tank
var gunship = new unitStats("Gunship",40, 0.8, 225, 20, 40, "art/speeder4b.png", "art/speeder4a.png", "art/speeder4icon.png", 1500, false); //Powerful speeder

var gunshipstatic = new unitStats("Gunship",40, 0.001, 225, 20, 40, "art/speeder4b.png", "art/speeder4a.png", "art/speeder4icon.png", 1500, false); //static variant