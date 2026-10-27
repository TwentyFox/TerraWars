# TerraWars Refactor Plan

## Overview
Convert the PHP-dependent game into a fully client-side application by removing all server dependencies (PostgreSQL, PHP, authentication, preferences, leaderboards) and refactoring the monolithic main.js (674 lines) into modular, single-responsibility JavaScript files.

---

## Phase 1: Remove Server Dependencies

### What's being removed
| File | Reason |
|------|--------|
| `play.php` | Replaced by static `index.html` |
| `leaderboards.php` | Server-side leaderboard submission |
| `updatePreferences.php` | Server-side hue preference |
| All PostgreSQL calls | Local-only, no database |
| Login/authentication system | No server to authenticate against |
| Score submission form | No server to submit to |
| Hue slider preference | Simplified to hardcoded default |

### What happens to affected JS code
- `score.points` and `score.timer` will remain as local-only tracking
- `calculateScore()` will be simplified (no form submission, just display)
- `teamHueShift` stays as `const DEFAULT_HUE = 0` (hardcoded default, no preference)
- `setTeamHueShift()` function is removed entirely

---

## Phase 2: New File Architecture

```
TerraWars/
├── index.html              # Static entry point (replaces play.php)
├── stylesheet.css          # Simplified styling
├── js/
│   ├── globals.js          # Shared state, canvas, constants
│   ├── input.js            # Keyboard + mouse input
│   ├── utils.js            # pythag(), playSound(), drawHealthBar(), getFont()
│   ├── ui.js               # UI class (HUD, win/lose screens)
│   ├── team.js             # Team class (unit selection, building, economy)
│   ├── unit.js             # Unit class + createUnit() + unitStats constructors
│   ├── crystal.js          # Crystal class (resource nodes)
│   ├── vfx.js              # VFX class + createVFX() (explosions, debris)
│   ├── game.js             # start(), main(), render(), calculateScore()
│   └── AI.js               # (unchanged - already modular)
├── art/                    # (unchanged)
└── sfx/                    # (unchanged)
```

### Module Responsibilities

| Module | Exports | Dependencies |
|--------|---------|--------------|
| `globals.js` | `cvs`, `ctx`, `unitMap`, `unitID`, `crystals`, `vfxMap`, `vfxID`, `shadow`, `camera`, `DEFAULT_HUE`, `score`, `ui`, `friendlyTeam`, `enemyTeam`, `enemy` | None |
| `input.js` | `keyCode`, `mx`, `my`, `mxg`, `myg`, `mbutton`, `initInputHandlers()` | `globals.js` (cvs) |
| `utils.js` | `pythag()`, `playSound()`, `drawHealthBar()`, `getFont()` | `globals.js` (ctx) |
| `ui.js` | `UI` class | `globals.js`, `utils.js` |
| `team.js` | `team` class | `globals.js`, `unit.js` (createUnit), `utils.js` |
| `unit.js` | `unit` class, `createUnit()`, `unitStats` constructors + `hq`, `speeder`, `lighttank`, `miner`, `medtank`, `heavytank`, `gunship`, `gunshipstatic` | `globals.js`, `utils.js` |
| `crystal.js` | `crystal` class | `globals.js`, `utils.js` |
| `vfx.js` | `vfx` class, `createVFX()` | `globals.js` |
| `game.js` | `start()`, `main()`, `render()`, `calculateScore()` | All other modules |
| `AI.js` | `AI` class | `globals.js` (unitMap, enemyTeam), `unit.js` |

---

## Phase 3: Code Improvements & Fixes

### Bug Fixes
1. **`keyCode` initial value**: Currently `let keyCode;` (undefined), but `main()` checks `if (keyCode != "noCode")` — this will fail initially. Set `keyCode = "noCode"` as initial value.
2. **Image loading in render loop**: `UI.render()` creates `new Image()` every frame for icons. Preload all unit icon images instead.
3. **Image loading on hover**: Unit render creates image in `isMouseOver` path for icon tooltip. Preload all sprites.
4. **Variable naming**: `mbutton` compared as string `"0"` elsewhere but event.button returns number. Fix type comparison.

### Cleanup
1. Remove all `console.log()` calls
2. Remove commented-out code blocks
3. Remove unused `mapData.js` (empty stub)
4. Remove unused variables (`d = new Date()`)
5. Fix the `mbutton` reset to use `null` instead of `"none"` for clarity

### Performance Improvements
1. Preload all unit sprites in `start()` instead of creating `new Image()` every frame
2. Use a single sprite sheet or preloaded image cache
3. Avoid re-creating the same Image objects repeatedly

---

## Phase 4: File-by-File Detailed Breakdown

### `index.html` (new)
- Static HTML5 document
- Embedded how-to-play instructions from play.php (but static, no PHP)
- Canvas element (600x800)
- Start Game button (always visible, no login gate)
- Credits section
- Score display (local only, no submission)
- Load all JS files in dependency order:
  1. `js/globals.js`
  2. `js/utils.js`
  3. `js/unit.js` (unitStats constructors)
  4. `js/crystal.js`
  5. `js/vfx.js`
  6. `js/ui.js`
  7. `js/team.js`
  8. `js/input.js`
  9. `js/AI.js`
  10. `js/game.js`

### `js/globals.js` (new)
```javascript
// Canvas
const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");

// Game collections
const unitMap = new Map();
let unitID = 0;
const crystals = [];
const vfxMap = new Map();
let vfxID = 0;

// Assets
const shadow = new Image();
shadow.src = "art/Shadow.png";
const splash = new Image();
splash.src = "art/terrawars.png";

// Game state
let camera = 0;
const DEFAULT_HUE = 0;
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

// Splash screen
splash.onload = () => { ctx.drawImage(splash, 0, 0); };
```

### `js/input.js` (new)
- `keyCode` variable (initialized to `"noCode"`)
- `mx`, `my`, `mxg`, `myg` mouse position globals
- `mbutton` mouse button global
- `document.onkeydown` handler
- `cvs.onmousemove` handler
- `cvs.onmousedown` handler
- `cvs.oncontextmenu` handler (prevent context menu)

### `js/utils.js` (new)
- `pythag(x1, x2, y1, y2)` — distance calculation
- `playSound(path, volume)` — audio playback
- `drawHealthBar(x, y, health, maxHealth)` — health bar rendering
- `getFont()` — sets canvas font style

### `js/ui.js` (new)
- `UI` class constructor
- `ui.render()` — HUD rendering (unit icons, money, timer)
- `ui.isMouseOver(x, y)` — hit testing
- `ui.drawWinScreen()` — victory overlay
- `ui.drawLoseScreen()` — defeat overlay
- Preload unit icon images in constructor

### `js/team.js` (new)
- `team` class constructor (unitSelection, money, isBuilding)
- `team.build(u)` — purchase and create unit
- `team.toggleBuild(u)` — toggle build mode
- `team.logic()` — build placement UI and click handling

### `js/unit.js` (new)
- `unitStats` constructor (from existing unitStats.js)
- All unit definitions: `hq`, `speeder`, `lighttank`, `miner`, `medtank`, `heavytank`, `gunship`, `gunshipstatic`
- `unit` class with methods: `movement()`, `attack()`, `render()`, `death()`, `logic()`, `hurt()`, `heal()`, `isMouseOver()`, `minerMovement()`, `minerLogic()`, `mine()`
- `createUnit(stats, x, y, isEnemy)` — factory function

### `js/crystal.js` (new)
- `crystal` class with `render()` method

### `js/vfx.js` (new)
- `vfx` class with `render()` method
- `createVFX(x, y, type)` — factory function

### `js/game.js` (new)
- `start()` — game initialization
- `main()` — game loop (60fps via setInterval)
- `render()` — render all game objects
- `calculateScore()` — simplified (no server submission)

### `AI.js` (updated)
- No changes needed — already purely client-side

---

## Dependency Graph

```
index.html
  └?-> stylesheet.css
  └?-> js/globals.js ──────────────────────────────────────────┐
  └?-> js/utils.js (depends on: globals) ─────────────────────┐│
  └?-> js/unit.js (depends on: globals, utils) ───────────────┐││
  └?-> js/crystal.js (depends on: globals, utils) ───────────┐│││
  └?-> js/vfx.js (depends on: globals) ──────────────────────┐││││
  └?-> js/ui.js (depends on: globals, utils) ────────────────┐│││││
  └?-> js/team.js (depends on: globals, unit) ───────────────┐││││││
  └?-> js/input.js (depends on: globals) ────────────────────┐│││││││
  └?-> js/AI.js (depends on: globals, unit) ─────────────────┐││││││││
  └?-> js/game.js (depends on: ALL) ─────────────────────────┘││││││││
                                                               ??????????
```

Scripts must be loaded in this exact order in index.html.

---

## Files to Delete

| File | Reason |
|------|--------|
| `play.php` | Replaced by index.html |
| `leaderboards.php` | No server |
| `updatePreferences.php` | No server |
| `mapData.js` | Empty/unused stub |

## Files to Keep Unchanged

| File | Reason |
|------|--------|
| `art/*` | Game assets |
| `sfx/*` | Audio assets |
| `AI.js` | Already modular, no server deps |

## Files to Modify

| File | Changes |
|------|---------|
| `stylesheet.css` | Minor cleanup, remove unused styles |
| `unitStats.js` | Merged into `js/unit.js`, then deleted|