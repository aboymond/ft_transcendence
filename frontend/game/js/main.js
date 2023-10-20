
import {GlowFilter} from '@pixi/filter-glow';

var myPixi;
var ball;
var playerPad;
var computerPad;
var gameStarted = false;

let keys = {};

window.addEventListener('keydown', function(e) {
	keys[e.keyCode] = true;
});

window.addEventListener('keyup', function(e) {
	keys[e.keyCode] = false;
});




$(document).ready(function(){
	initPixi();
	createGame();
	gameLoop();
	// actionKeys();
	$(window).on('resize', resizePixi);
	
	myPixi.ticker.add(function() {
		if ((computerPad.x + computerPad.width / 2 < myPixi.view.width) && (ball.x + ball.width / 2 > computerPad.x + computerPad.width / 2))
			computerPad.x += (ball.x - computerPad.x) * 0.09;
		else if ((computerPad.x - computerPad.width / 2 > 0) && (ball.x - ball.width / 2 < computerPad.x - computerPad.width / 2))
			computerPad.x += (ball.x - computerPad.x) * 0.09;
		// else if (computerPad.x + computerPad.width / 2 > myPixi.view.width)
		// 	computerPad.x -= 1;
		// else if (computerPad.x - computerPad.width / 2 < 0)
		// 	computerPad.x += 1;
		// else
		// 	computerPad.x += (ball.x - computerPad.x) * 0.09;


		if (!gameStarted) {
				ball.x = playerPad.x;
				ball.y = playerPad.y - 50;
			}
		else {
			console.log(gameStarted);
			ball.y -= ball.vel.y;
			ball.x += ball.vel.x;
			
			if (ball.y < 0){
				console.log("Player win !");
				ball.vel.x = 0;
				ball.vel.y = 5;
				gameStarted = false;
			}
			else if (ball.y > myPixi.view.height){
				console.log("Computer win !");
				ball.vel.x = 0;
				ball.vel.y = 5;
				gameStarted = false;
			}
	
			if (ball.x < 0){
				console.log("Left wall !");
				ball.vel.x = -ball.vel.x;
			}
			else if (ball.x > myPixi.view.width){
				console.log("Right wall!");
				ball.vel.x = -ball.vel.x;
			}
	
			if (ball.y - ball.height / 2 < computerPad.y + computerPad.height / 2 && ball.y > computerPad.y - computerPad.height / 2) {
				if (ball.x > computerPad.x - computerPad.width / 2 && ball.x < computerPad.x + computerPad.width / 2) {
					ball.vel.y = -ball.vel.y;
					ball.vel.x = (ball.x - computerPad.x ) / (computerPad.width / 2) * 5;
				}
	
			}
		
			if (ball.y + ball.height / 2 > playerPad.y - playerPad.height / 2 && ball.y < playerPad.y + playerPad.height / 2) {
				if (ball.x > playerPad.x - playerPad.width / 2 && ball.x < playerPad.x + playerPad.width / 2) {
					ball.vel.y = -ball.vel.y;
					ball.vel.x = (ball.x - playerPad.x ) / (playerPad.width / 2) * 5;
				}
			}
		}
	
	});
	
});

function initPixi(){
	var gameWindowWidth = $('#game_window').width();
	var gameWindowHeight = $('#game_window').height();

	myPixi = new PIXI.Application({
		width: gameWindowWidth,
		height: gameWindowHeight,
		antialias: true,
		backgroundAlpha: 0,
	});


	

	$('#game_window').append(myPixi.view);

}

function resizePixi() {



	var gameWindowWidth = $('#game_window').width();
	var gameWindowHeight = $('#game_window').height();
	myPixi.renderer.resize(gameWindowWidth, gameWindowHeight);
	
}


function createGame(){
	ball = createBall(10, 0x1aff00);
	ball.x = myPixi.view.width / 2;
	ball.y = myPixi.view.height / 2;
	ball.vel = {x: 0, y: 5};
	myPixi.stage.addChild(ball);

	playerPad = createPad(100, 10, 0x1aff00);
	playerPad.x = myPixi.view.width / 2;
	playerPad.y = myPixi.view.height - 50;
	myPixi.stage.addChild(playerPad);

	computerPad = createPad(100, 10, 0x1aff00);
	computerPad.x = myPixi.view.width / 2;
	computerPad.y = 50;
	myPixi.stage.addChild(computerPad);

	const glowFilter = new GlowFilter({
		distance: 35,
		outerStrength: 1.2,
		innerStrength: 0,
		color: PIXI.utils.hex2string(0x86FF86),
	});

	ball.filters = [glowFilter];
	playerPad.filters = [glowFilter];
	computerPad.filters = [glowFilter];
	
};

function createBall(size, color){
	var ball = new PIXI.Graphics();
	ball.beginFill(color);
	ball.drawRect(0, 0, size, size);
	ball.endFill();
	return ball;

};

function createPad(width, height, color){
	var ball = new PIXI.Graphics();
	ball.beginFill(color);
	ball.drawRect(-width/2, -height/2, width, height);
	ball.endFill();
	return ball;

};

// function actionKeys(e) {
//     console.log(keys);
//     if (keys[32])
//     gameStarted = true;
// }

function gameLoop() {
	// console.log(keys);
	if (keys[39]) {
		if (!((playerPad.x + playerPad.width / 2) > myPixi.view.width)) {
			playerPad.x += 10;
		}
		else
			console.log("Touch right wall");
	}
	
	if (keys[37]) {
		if (!((playerPad.x - playerPad.width / 2) < 0)) {
			playerPad.x -= 10;
		}
		else
		console.log("Touch left wall");
	}
	if (keys[32])
		if (gameStarted == false)
			gameStarted = true;

   
	// console.log(gameStarted);
	requestAnimationFrame(gameLoop);
}