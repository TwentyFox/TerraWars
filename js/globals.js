// Canvas
const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");

// Splash screen
const splash = new Image();
splash.src = "art/terrawars.png";
splash.onload = () => {
    ctx.drawImage(splash, 0, 0);
};

// Game collections
const unitMap = new Map();
let unitID = 0;
const crystals = [];
const vfxMap = new Map();
let vfxID = 0;

// Assets
const shadow = new Image();
shadow.src = "art/Shadow.png";

// Game state
let camera = 0;
let teamHueShift = 0;

const score = {
    timer: 0,
    points: 0
};

// Game objects (initialized in start())
let ui = null;
let friendlyTeam = null;
let enemyTeam = null;
let enemy = null;