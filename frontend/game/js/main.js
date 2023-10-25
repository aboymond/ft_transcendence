
// import pixi filter glow
import {GlowFilter} from '@pixi/filter-glow';
import { gsap } from 'gsap';

// init variables
var myPixi;
var ball;
var playerPad;
var computerPad;
var gameStarted = false;
var playerTurn = false;
var lvlBot = 0.09;
let keys = {};


// set keyup and keydown events
window.addEventListener('keydown', function(e) {
	keys[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
	keys[e.keyCode] = false;
});

// launch game
$(document).ready(function(){

	initPixi();
	createGame();
	gameLoop();
	$(window).on('resize', resizePixi);
	
	// game loop for ball
	myPixi.ticker.add(function() {

		// bot movement
		if ((computerPad.x + computerPad.width / 2 < myPixi.view.width) && (ball.x + ball.width / 2 > computerPad.x + computerPad.width / 2))
			computerPad.x += (ball.x - computerPad.x) * lvlBot;
		else if ((computerPad.x - computerPad.width / 2 > 0) && (ball.x - ball.width / 2 < computerPad.x - computerPad.width / 2))
			computerPad.x += (ball.x - computerPad.x) * lvlBot;

		// position when game is not started
		if (!gameStarted) {

			// turn player or computer
			if (playerTurn) {
				// ball position
				if (ball.x - ball.width / 2 < playerPad.x - playerPad.width / 2) {
					ball.x = playerPad.x - playerPad.width / 2 + ball.width / 2;
				} else if (ball.x + ball.width / 2 > playerPad.x + playerPad.width / 2) {
					ball.x = playerPad.x + playerPad.width / 2 - ball.width / 2;
				}
				ball.vel.x = (ball.x - playerPad.x ) / (playerPad.width / 2) * 5;
				ball.y = playerPad.y - 25;
			}
			else {
				// ball position 
				if (ball.x - ball.width / 2 < computerPad.x - computerPad.width / 2) {
					ball.x = computerPad.x - computerPad.width / 2 + ball.width / 2;
				} else if (ball.x + ball.width / 2 > computerPad.x + computerPad.width / 2) {
					ball.x = computerPad.x + computerPad.width / 2 - ball.width / 2;
				}
				ball.vel.x = (ball.x - computerPad.x ) / (computerPad.width / 2) * 5;
				ball.y = computerPad.y + 25;
				botStart();
			}
		}
		else {
			console.log(gameStarted);

			// ball movement
			if (!playerTurn)
				ball.y += ball.vel.y;
			else 
				ball.y -= ball.vel.y;
			ball.x += ball.vel.x;
			
			// game over
			if (ball.y < 0){
				console.log("Player win !");
				ball.vel.x = 0;
				ball.vel.y = 5;
				playerPad.x = myPixi.view.width / 2;
				ball.x = playerPad.x;
				gameStarted = false;
			}
			else if (ball.y > myPixi.view.height){
				console.log("Computer win !");
				ball.vel.x = 0;
				ball.vel.y = 5;
				playerPad.x = myPixi.view.width / 2;
				ball.x = playerPad.x;
				gameStarted = false;
			}
	
			// touch wall
			if (ball.x < 0){
				console.log("Left wall !");
				ball.vel.x = -ball.vel.x;
			}
			else if (ball.x > myPixi.view.width){
				console.log("Right wall!");
				ball.vel.x = -ball.vel.x;
			}
	
			// ball direction when touch pad
			if (ball.y - ball.height / 2 < computerPad.y + computerPad.height / 2 && ball.y > computerPad.y - computerPad.height / 2) {
				if (ball.x > computerPad.x - computerPad.width / 2 && ball.x < computerPad.x + computerPad.width / 2) {
					ball.vel.y = -ball.vel.y;
					ball.vel.x = (ball.x - computerPad.x ) / (computerPad.width / 2) * 5;
				}
			}
		
			if ((ball.y + ball.height) / 2 > (playerPad.y - playerPad.height) / 2 && ball.y < playerPad.y + playerPad.height / 2) {
				if (ball.x > playerPad.x - playerPad.width / 2 && ball.x < playerPad.x + playerPad.width / 2) {
					ball.vel.y = -ball.vel.y;
					ball.vel.x = (ball.x - playerPad.x ) / (playerPad.width / 2) * 5;
				}
			}
		}
	
	});
	
});


// init pixi canvas
function initPixi(){

	// init window size
	var gameWindowWidth = $('#game_window').width();
	var gameWindowHeight = $('#game_window').height();

	myPixi = new PIXI.Application({
		// window size
		width: gameWindowWidth,
		height: gameWindowHeight,
		// antialiasing
		antialias: true,
		// transparent background
		backgroundAlpha: 0,
	});


	// add canvas to html

	$('#game_window').append(myPixi.view);

}

// resize canvas when window is resized
function resizePixi() {
	var gameWindowWidth = $('#game_window').width();
	var gameWindowHeight = $('#game_window').height();
	myPixi.renderer.resize(gameWindowWidth, gameWindowHeight);
	
}

// create game
function createGame(){
	// init ball
	ball = createBall(10, 0x1aff00);
	ball.x = myPixi.view.width / 2;
	ball.y = myPixi.view.height / 2;
	ball.vel = {x: 0, y: 5};
	myPixi.stage.addChild(ball);

	// init player pad
	playerPad = createPad(100, 10, 0x1aff00);
	playerPad.x = myPixi.view.width / 2;
	playerPad.y = myPixi.view.height - 50;
	myPixi.stage.addChild(playerPad);

	// create computer pad
	computerPad = createPad(100, 10, 0x1aff00);
	computerPad.x = myPixi.view.width / 2;
	computerPad.y = 50;
	myPixi.stage.addChild(computerPad);

	// create glow filter
	const glowFilter = new GlowFilter({
		distance: 35,
		outerStrength: 1.2,
		innerStrength: 0,
		color: PIXI.utils.hex2string(0x86FF86),
	});

	// add glow filter to ball and pads
	ball.filters = [glowFilter];
	playerPad.filters = [glowFilter];
	computerPad.filters = [glowFilter];
}

// create ball
function createBall(size, color){
	var ball = new PIXI.Graphics();
	ball.beginFill(color);
	ball.drawRect(0, 0, size, size);
	ball.endFill();
	return ball;
}

// create pad
function createPad(width, height, color){
	var ball = new PIXI.Graphics();
	ball.beginFill(color);
	ball.drawRect(-width/2, -height/2, width, height);
	ball.endFill();
	return ball;
}


// game loop 
function gameLoop() {
	// console.log(keys);

	// player movement right
	if (keys[39]) {
		if (!((playerPad.x + playerPad.width / 2) > myPixi.view.width)) {
			playerPad.x += 10;
		}
		else
			console.log("Touch right wall");
	}
	
	// player movement left
	if (keys[37]) {
		if (!((playerPad.x - playerPad.width / 2) < 0)) {
			playerPad.x -= 10;
		}
		else
		console.log("Touch left wall");
	}

	// start with space
	if (keys[32])
		if (gameStarted == false)
			gameStarted = true;

   
	// console.log(gameStarted);
	requestAnimationFrame(gameLoop);
}

function botStart() {
	gsap.to(computerPad, 1.5, {x: Math.random() * myPixi.view.width, ease:
		'expo.out', onComplete: function() {
			gameStarted = true;
		}})
}

