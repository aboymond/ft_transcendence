import { defaultColor } from "..";
import { SceneBase } from "./SceneBase"
import * as PIXI from 'pixi.js';

export class SceneGameVsBot extends SceneBase {

	private _data = {
		isStarted: false,
		ballVelocity: {x: 0, y: 5},
		playerAScore: 0,
		playerBScore: 0,
		playerTurnA: Math.random() < 0.5,
	}

	private _botLvl = this.root.botLvl;
	private _gameStarted = false;
	private _playerTurn = true;
	
	private _ball = new PIXI.Graphics();
	private _padBot = new PIXI.Graphics();
	private _padPlayer = new PIXI.Graphics();
	private _scoreText = new PIXI.Text('0 - 0', {fill: defaultColor});
	private _keysPressed: { [key: string]: boolean } = {};

	//=======================================
	// HOOK
	//=======================================

	public onStart(container: PIXI.Container) {
		//Init Ball
		container.addChild(this._initBall(10, 0x1aff00));
		this._ball.x = this.root.width / 2;
		this._ball.y = this.root.height / 2;

		//Init Pad A
		container.addChild(this._initPad(this._padBot, 100, 10, defaultColor));
		this._padPlayer.x = this.root.width / 2;
		this._padPlayer.y = this.root.height - 50;

		//Init Pad B
		container.addChild(this._initPad(this._padPlayer, 100, 10, defaultColor));
		this._padBot.x = this.root.width / 2;
		this._padBot.y = 50;

		//Init Score Text
		container.addChild(this._initScoreText());
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;
	}

	public onUpdate() {

		if (!this._gameStarted) 
			this._checkTurn()
		else {
			this._addVelocity()

		}
		this._checkCollisions()
		this._updatePadPosition();
	}

	public onFinish() {
	}

	public onKeyDown(e: KeyboardEvent) {
		this._keysPressed[e.code] = true;
	}

	public onKeyUp(e: KeyboardEvent) {
		delete this._keysPressed[e.code];
	}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initBall(size: number, color: number){
		this._ball.beginFill(color);
		this._ball.drawRect(0, 0, size, size);
		this._ball.endFill();
		return this._ball;
	}

	private _initPad(pad: PIXI.Graphics, width: number, height: number, color: number){
		pad.beginFill(color);
		pad.drawRect(-width/2, -height/2, width, height);
		pad.endFill();
		return pad;
	}

	private _initScoreText() {
		this._scoreText.alpha = 0.2;
		return this._scoreText;
	}

	//=======================================
	// UTILS 
	//=======================================

	private _addVelocity() {
    if (!this._playerTurn)
        this._ball.y += this._data.ballVelocity.y;
    else 
        this._ball.y -= this._data.ballVelocity.y;
    this._ball.x += this._data.ballVelocity.x;
  }
	
	private _checkCollisions() {
		if (this._ball.x - (this._ball.width / 2) <= 0) {
			console.log("Ball colision left");
			this._data.ballVelocity.x = -this._data.ballVelocity.x;
		}
		else if (this._ball.x + (this._ball.width) >= this.root.width){
			console.log("Ball colision right");
			this._data.ballVelocity.x = -this._data.ballVelocity.x;
		}

		if (this._ball.y <= this._padBot.y + this._padBot.height / 2){
			console.log("Ball colision botPad");
			this._data.ballVelocity.y = -this._data.ballVelocity.y;
		}
		else if (this._ball.y >= this._padPlayer.y - this._padPlayer.height ) {
			console.log("Ball colision playerPad");
			this._data.ballVelocity.y = -this._data.ballVelocity.y;
		}
		


	}

	private _checkTurn() {

		// turn player or computer
		if (this._playerTurn) {
			// ball position
			if (this._ball.x - this._ball.width / 2 < this._padPlayer.x - this._padPlayer.width / 2) {
				this._ball.x = this._padPlayer.x - this._padPlayer.width / 2 - this._ball.width / 2;
			}
			else if (this._ball.x + this._ball.width / 2 > this._padPlayer.x + this._padPlayer.width / 2) {
				this._ball.x = this._padPlayer.x + this._padPlayer.width / 2 - this._ball.width / 2;
			}
			this._data.ballVelocity.x = (this._ball.x - this._padPlayer.x ) / (this._padPlayer.width / 2) * 5;
			this._ball.y = this._padPlayer.y - 25;
		}
		else {
			// this._ball position 
			// botStart();
			if (this._ball.x - this._ball.width / 2 < this._padBot.x - this._padBot.width / 2) {
				this._ball.x = this._padBot.x - this._padBot.width / 2 - this._ball.width / 2;
			}
			else if (this._ball.x + this._ball.width / 2 > this._padBot.x + this._padBot.width / 2) {
				this._ball.x = this._padBot.x + this._padBot.width / 2 - this._ball.width / 2;
			}
			this._data.ballVelocity.x = (this._ball.x - this._padBot.x ) / (this._padBot.width / 2) * 5;
			this._ball.y = this._padBot.y + 25;
		}
	}

	private _updatePadPosition() {
				// player movement right
		if (this._keysPressed['ArrowRight']) {
			if (!((this._padPlayer.x + this._padPlayer.width / 2) > this.root.width)) {
				this._padPlayer.x += 10;
			}
			else
				console.log("Pad touch right wall");
		}
		
		// player movement left
		if (this._keysPressed['ArrowLeft']) {
			if (!((this._padPlayer.x - this._padPlayer.width / 2) < 0)) {
				this._padPlayer.x -= 10;
			}
			else
			console.log("Pad touch left wall");
		}

		// start with space
		if (this._keysPressed['Space']) {
			if (this._gameStarted == false)
				this._gameStarted = true;
			console.log("press space " + this._gameStarted);
		}
	}
} 