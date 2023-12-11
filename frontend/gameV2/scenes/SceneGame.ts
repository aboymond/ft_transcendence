import { defaultColor } from '..';
import { SceneBase } from './SceneBase';
import * as PIXI from 'pixi.js';

class SceneGame extends SceneBase {
	private _data = {
		isStarted: false,
		ballVelocity: { x: 0, y: 5 },
		playerAScore: 0,
		playerBScore: 0,
		playerTurnA: Math.random() < 0.5,
		ball_x: 0,
		ball_y: 0,
		padA_x: 0,
		padA_y: 0,
		padB_x: 0,
		padB_y: 0,
		player1_score: 0,
		player2_score: 0,
	};

	private _ball = new PIXI.Graphics();
	private _padA = new PIXI.Graphics();
	private _padB = new PIXI.Graphics();
	private _scoreText = new PIXI.Text('0 - 0', { fill: defaultColor });

	//=======================================
	// HOOK
	//=======================================

	public onStart(container: PIXI.Container) {
		//Init Ball
		container.addChild(this._initBall(10, 0x1aff00));
		this._ball.x = this.root.width / 2;
		this._ball.y = this.root.height / 2;

		//Init Pad A
		container.addChild(this._initPad(this._padA, 100, 10, defaultColor));
		this._padA.x = this.root.width / 2;
		this._padA.y = this.root.height - 50;

		//Init Pad B
		container.addChild(this._initPad(this._padB, 100, 10, defaultColor));
		this._padB.x = this.root.width / 2;
		this._padB.y = 50;

		//Init Score Text
		container.addChild(this._initScoreText());
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;
	}

	public onUpdate() {
		this._addVelocity();
		this._checkCollisions();
		// Fetch the game state from the backend
		// Update the game display based on the fetched state
		// Send game actions to the backend
	}

	public updateState(data: any): void {
		this._data = data;
		this._updateDisplay();
	}

	public onFinish() {}

	public onKeyDown() {}

	public onKeyUp() {}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initBall(size: number, color: number) {
		this._ball.beginFill(color);
		this._ball.drawRect(0, 0, size, size);
		this._ball.endFill();
		return this._ball;
	}

	private _initPad(pad: PIXI.Graphics, width: number, height: number, color: number) {
		pad.beginFill(color);
		pad.drawRect(-width / 2, -height / 2, width, height);
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

	private _addVelocity() {}

	private _checkCollisions() {}

	private _updateDisplay(): void {
		this._ball.x = this._data.ball_x;
		this._ball.y = this._data.ball_y;
		this._padA.x = this._data.padA_x;
		this._padA.y = this._data.padA_y;
		this._padB.x = this._data.padB_x;
		this._padB.y = this._data.padB_y;
		this._scoreText.text = `${this._data.player1_score} - ${this._data.player2_score}`;
	}
}

export default SceneGame;
