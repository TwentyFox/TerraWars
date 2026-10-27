// Keyboard state
let keyCode = "noCode";

// Taken from Workshop 4 slides
document.onkeydown = (event) => {
    keyCode = event.key;
    if (keyCode === "ArrowUp" || keyCode === "ArrowDown") {
        event.preventDefault();
    }
};

// Mouse position
let mx = 0;
let my = 0;
let myg = 0;
let mxg = 0;

cvs.onmousemove = (event) => {
    mx = event.offsetX;
    my = event.offsetY;

    // Relates to camera position
    myg = event.offsetY + camera;
    mxg = event.offsetX;
};

// Mouse button state
let mbutton = null;

cvs.onmousedown = (event) => {
    mbutton = event.button;
};

// Prevent context menu on right-click
cvs.oncontextmenu = (event) => {
    event.preventDefault();
};