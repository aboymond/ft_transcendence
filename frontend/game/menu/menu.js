
import {GlowFilter} from '@pixi/filter-glow';
// import { Color } from 'pixi.js';
import * as PIXI from 'pixi.js';


var pushStart = false;
var myPixiMenu;
var startText;
var spaceText;
let keys = {};


window.addEventListener('keydown', function(e) {
	keys[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
	keys[e.keyCode] = false;
});

export function initMenu() {
    var gameWindowWidth = $('#game_window').width();
    var gameWindowHeight = $('#game_window').height();

    myPixiMenu = new PIXI.Application({
        width: gameWindowWidth,
        height: gameWindowHeight,
        antialias: true,
        // backgroundColor: 0x374649,
        backgroundAlpha: 0,
    });

    const glowFilter = new GlowFilter({
        distance: 30,
        outerStrength: 1.2,
        innerStrength: 0,
        color: 0x86FF86,
    });
    console.log('color ' + glowFilter.color);

    createTextPong(gameWindowWidth, gameWindowHeight, glowFilter);
    createTextSpace(gameWindowWidth, gameWindowHeight, glowFilter);
    
    
    myPixiMenu.ticker.add(function () {
        if (keys[32]) {
            if (!pushStart) {
                pushStart = true;
                // destroyMenu();
                console.log("Menu destroy");
                console.log(pushStart);
            }
        }
    });

    
    $('#game_window').append(myPixiMenu.view);
    setInterval(blinkText, 800);
}

// function createTextPong (x, y, glow) {
//     const style = new PIXI.TextStyle({
//         fontFamily: 'Pixelmania',
//         fill: 0x1aff00,
//         fontSize: y / 2 - 120
//     });

//     startText = new PIXI.Text('PONG', style);
//     startText.filters = [glow];
//     console.log(startText);

//     startText.x = x / 2 - startText.width / 2;
//     startText.y = (y / 2) / 2 - startText.height / 2;

//     myPixiMenu.stage.addChild(startText);
// }

// function createTextSpace (x, y, glow) {
//     const style = new PIXI.TextStyle({
//         fontFamily: 'arial',
//         fill: 0x1aff00,
//         fontSize: 20
//     });
//     spaceText = new PIXI.Text('PRESS SPACE TO START', style);
//     spaceText.filters = [glow];
    

//     spaceText.x = x / 2 - spaceText.width / 2;
//     spaceText.y = y - 100 - spaceText.height / 2;

//     myPixiMenu.stage.addChild(spaceText);
// }

// function blinkText() {
//     if (spaceText) {
//         spaceText.visible = !spaceText.visible;
//     }
   
// }

// export function destroyMenu() {
//     if (myPixiMenu) {
//         myPixiMenu.stage.removeChildren(); // Supprimez tous les éléments de la scène.
//         myPixiMenu.destroy(true); // Supprimez le canevas de la page.
//     }
// }

// export { pushStart };
