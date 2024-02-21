import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { SceneWinOrLooseLocal } from './SceneWinOrLooseLocal';
import * as PIXI from 'pixi.js';
import { defaultColor } from '../index';
import { AudioManager } from '../AudioManager';

export class SceneGamePvpLocal extends SceneBase {
	// FOR THE BACK ======================================
	private _data = {
		ballVelocity: { x: 0, y: 5 },
		player1_score: 0,
		player2_score: 0,
		playerTurnA: Math.random() < 0.5,
	};

	private _gameStarted = false;
	private _playerTurn = true;
	private _exitBool = false;
	private _exitYesNO = true;
	//==========================================================

	private _ball = new PIXI.Graphics();
	private _padPlayer2 = new PIXI.Graphics();
	private _padPlayer1 = new PIXI.Graphics();
	private _scoreText = new PIXI.Text('0\n \n0', { fill: defaultColor });
	private _keysPressed: { [key: string]: boolean } = {};
	private _escapeKeyPressed = false;

	private _exitMenu = new PIXI.Container();
	private _yesOption!: PIXI.Text;
	private _noOption!: PIXI.Text;
	private _exitText!: PIXI.Text;

	//=======================================
	// HOOK
	//=======================================

	public async onStart(container: PIXI.Container) {
		//Init Ball
		container.addChild(this._initBall(0x1aff00, 1));
		this._ball.x = this.root.width / 2;
		this._ball.y = this.root.height / 2;

		//Init Pad A
		container.addChild(this._initPad(this._padPlayer2, 100, 10, defaultColor));
		this._padPlayer2.x = this.root.width / 2;
		this._padPlayer2.y = (this.root.height * 10) / 100;

		//Init Pad B
		container.addChild(this._initPad(this._padPlayer1, 100, 10, defaultColor));
		this._padPlayer1.x = this.root.width / 2;
		this._padPlayer1.y = (this.root.height * 90) / 100;

		//Init Score Text
		container.addChild(this._initScoreText());
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;

		this._exitMenu = this._initExitMenu();
		container.addChild(this._exitMenu);
	}

	public onUpdate() {
		if (!this._exitBool) {
			if (!this._gameStarted) this._checkTurn();
			else {
				this._addVelocity();
				this._checkCollisions();
				this._checkifBallIsOut();
			}
		}
		this._updatePadPosition();
		if (this._data.player1_score === this.root.amountVictory) {
			this.root.playerAWin = true;
			this.root.loadScene(new SceneWinOrLooseLocal(this.root, 'Player 1'));
		} else if (this._data.player2_score === this.root.amountVictory) {
			this.root.playerAWin = false;
			this.root.loadScene(new SceneWinOrLooseLocal(this.root, 'Player 2'));
		}
	}

	public onFinish() {
		AudioManager.reset();
	}

	public onKeyDown(e: KeyboardEvent) {
		this._keysPressed[e.code] = true;

		if (e.code === 'Escape' && !this._escapeKeyPressed) {
			this._escapeKeyPressed = true;
			this._exitBool = !this._exitBool;
			this._exitMenu.visible = this._exitBool;
		}
	}

	public onKeyUp(e: KeyboardEvent) {
		delete this._keysPressed[e.code];

		if (e.code === 'Escape') {
			this._escapeKeyPressed = false;
		}
	}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initBall(color: number, size: number) {
		const pourcentage = 3;
		const newWidth = Math.floor((this.root.width * pourcentage) / 100);
		const ratio = size / size;
		const newHigth = Math.floor(newWidth / ratio);

		this._ball.beginFill(color);
		this._ball.drawRect(0, 0, newWidth, newHigth);
		this._ball.endFill();
		return this._ball;
	}

	private _initPad(pad: PIXI.Graphics, width: number, height: number, color: number) {
		const pourcentage = 25;
		const newWidth = Math.floor((this.root.width * pourcentage) / 100);
		const ratio = width / height;
		const newHigth = Math.floor(newWidth / ratio);

		pad.beginFill(color);
		pad.drawRect(-newWidth / 2, -newHigth / 2, newWidth, newHigth);
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
		if (this._playerTurn) this._ball.y -= this._data.ballVelocity.y;
		else this._ball.y += this._data.ballVelocity.y;
		this._ball.x += this._data.ballVelocity.x;
	}

	private _checkCollisions() {
		// Wall colision
		if (this._ball.x <= 1 || this._ball.x + this._ball.width / 2 >= this.root.width - 1) {
			this._data.ballVelocity.x = -this._data.ballVelocity.x;
			AudioManager.play('touchBall');
		}

		// Pad colision
		if (
			this._ball.x > this._padPlayer2.x - this._padPlayer2.width / 2 &&
			this._ball.x < this._padPlayer2.x + this._padPlayer2.width / 2
		) {
			if (this._ball.y <= this._padPlayer2.y + this._padPlayer2.height / 2 + 1) {
				AudioManager.play('touchBall');
				this._data.ballVelocity.y = -this._data.ballVelocity.y;
				this._data.ballVelocity.x = ((this._ball.x - this._padPlayer2.x) / (this._padPlayer2.width / 2)) * 5;
			}
		}
		if (
			this._ball.x > this._padPlayer1.x - this._padPlayer1.width / 2 &&
			this._ball.x < this._padPlayer1.x + this._padPlayer1.width / 2
		) {
			if (this._ball.y + this._ball.height / 2 >= this._padPlayer1.y - this._padPlayer1.height - 1) {
				AudioManager.play('touchPad');
				this._data.ballVelocity.x = ((this._ball.x - this._padPlayer1.x) / (this._padPlayer1.width / 2)) * 5;
				this._data.ballVelocity.y = -this._data.ballVelocity.y;
			}
		}
	}

	private _checkTurn() {
		// turn player or computer

		if (this._playerTurn) {
			// ball position
			if (this._ball.x - this._ball.width / 2 < this._padPlayer1.x - this._padPlayer1.width / 2) {
				this._ball.x = this._padPlayer1.x - this._padPlayer1.width / 2;
			} else if (this._ball.x + this._ball.width / 2 > this._padPlayer1.x + this._padPlayer1.width / 2) {
				this._ball.x = this._padPlayer1.x + this._padPlayer1.width / 2 - this._ball.width;
			}
			this._data.ballVelocity.x = ((this._ball.x - this._padPlayer1.x) / (this._padPlayer1.width / 2)) * 5;
			this._ball.y = this._padPlayer1.y - this._padPlayer1.height / 2 - this._ball.height * 2;
		} else {
			// ball position
			// this._botStart();
			if (this._ball.x - this._ball.width / 2 < this._padPlayer2.x - this._padPlayer2.width / 2) {
				this._ball.x = this._padPlayer2.x - this._padPlayer2.width / 2;
			} else if (this._ball.x + this._ball.width / 2 > this._padPlayer2.x + this._padPlayer2.width / 2) {
				this._ball.x = this._padPlayer2.x + this._padPlayer2.width / 2 - this._ball.width;
			}
			this._data.ballVelocity.x = ((this._ball.x - this._padPlayer2.x) / (this._padPlayer2.width / 2)) * 5;
			this._ball.y = this._padPlayer2.y - this._padPlayer2.height / 2 + this._ball.height * 2;
		}
	}

	private _updatePadPosition() {
		if (!this._exitBool) {
			// player movement right
			if (this._keysPressed['ArrowRight']) {
				if (!(this._padPlayer1.x + this._padPlayer1.width / 2 > this.root.width)) {
					this._padPlayer1.x += 10;
				}
			}

			// player movement left
			if (this._keysPressed['ArrowLeft']) {
				if (!(this._padPlayer1.x - this._padPlayer1.width / 2 < 0)) {
					this._padPlayer1.x -= 10;
				}
			}

			if (this._keysPressed['KeyD']) {
				if (!(this._padPlayer2.x + this._padPlayer2.width / 2 > this.root.width)) {
					this._padPlayer2.x += 10;
				}
			}

			if (this._keysPressed['KeyA']) {
				if (!(this._padPlayer2.x - this._padPlayer2.width / 2 < 0)) {
					this._padPlayer2.x -= 10;
				}
			}

			// start with space
			if (this._keysPressed['Space']) {
				if (this._playerTurn) if (this._gameStarted == false) this._gameStarted = true;
			}

			if (this._keysPressed['KeyS']) {
				if (!this._playerTurn) if (this._gameStarted == false) this._gameStarted = true;
			}
		} else {
			if (this._keysPressed['ArrowRight']) {
				this._exitYesNO = false;
				this._noOption.style.fill = defaultColor;
				this._yesOption.style.fill = 0x053100;
			}
			if (this._keysPressed['ArrowLeft']) {
				this._exitYesNO = true;
				this._yesOption.style.fill = defaultColor;
				this._noOption.style.fill = 0x053100;
			}
			if (this._keysPressed['Enter']) {
				if (this._exitYesNO) {
					this.root.loadScene(new SceneMenu(this.root));
				} else {
					this._exitBool = false;
					this._exitMenu.visible = false;
				}
			}
		}
	}

	private _checkifBallIsOut() {
		if (this._ball.y < 10 || this._ball.y < this._padPlayer2.y) {
			console.log('Player 1 win !');
			this._data.ballVelocity.x = 0;
			this._data.ballVelocity.y = 5;
			this._padPlayer1.x = this.root.width / 2;
			this._padPlayer2.x = this.root.width / 2;
			this._ball.x = this._padPlayer1.x;
			this._gameStarted = false;
			this._playerTurn = false;
			this._data.player1_score++;
			this._updateScoreText();
		}
		if (this._ball.y > this.root.height - 10 || this._ball.y > this._padPlayer1.y) {
			console.log('Player 2 win !');
			this._data.ballVelocity.x = 0;
			this._data.ballVelocity.y = 5;
			this._padPlayer1.x = this.root.width / 2;
			this._padPlayer2.x = this.root.width / 2;
			this._ball.x = this._padPlayer1.x;
			this._gameStarted = false;
			this._playerTurn = true;
			this._data.player2_score++;
			this._updateScoreText();
		}
	}

	private _updateScoreText() {
		this._scoreText.text = this._data.player2_score + '\n \n' + this._data.player1_score;
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;
		this._scoreText.alpha = 0.2;
	}

	private _initExitMenu(): PIXI.Container {
		const menu = new PIXI.Container();

		const background = new PIXI.Graphics();
		background.beginFill('green');
		background.drawRect(-280, -150, 280, 150);
		background.endFill();
		background.visible = true;
		background.x = this.root.width / 2 + background.width / 2;
		background.y = this.root.height / 2 + background.height / 2;
		menu.addChild(background);

		this._exitText = new PIXI.Text('Exit ?', { fill: defaultColor });
		this._exitText.x = background.x - background.width / 2 - this._exitText.width / 2;
		this._exitText.y = background.y - 125;
		menu.addChild(this._exitText);

		this._yesOption = new PIXI.Text('Yes', { fill: defaultColor });
		this._yesOption.x = background.x - (background.width / 2 + this._yesOption.width / 2) - 50;
		this._yesOption.y = background.y - 50;
		menu.addChild(this._yesOption);

		this._noOption = new PIXI.Text('No', { fill: 0x053100 });
		this._noOption.x = background.x - (background.width / 2 + this._noOption.width / 2) + 50;
		this._noOption.y = background.y - 50;
		menu.addChild(this._noOption);

		menu.visible = false;

		return menu;
	}
}
