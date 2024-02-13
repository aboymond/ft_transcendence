import { defaultColor, glowFilter } from '..';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { SceneWinOrLoose } from './SceneWinOrLoose';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { sound } from '@pixi/sound';

export class SceneGameVsBot extends SceneBase {
	// FOR THE BACK ======================================
	private _data = {
		ballVelocity: { x: 0, y: 5 },
		player1_score: 0,
		player2_score: 0,
		playerTurnA: Math.random() < 0.5,
	};

	private _botLvl = this.root.botLvl;
	private _gameStarted = false;
	private _playerTurn = true;
	private _botStarting = false;
	private _exitBool = false;
	private _exitYesNO = true;
	//==========================================================

	private _ball = new PIXI.Graphics();
	private _padBot = new PIXI.Graphics();
	private _padPlayer = new PIXI.Graphics();
	private _scoreText = new PIXI.Text('0 - 0', { fill: defaultColor });
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
		if (!sound.exists('touchPad')) sound.add('touchPad', './sound/touchPad.mp3');
		if (!sound.exists('touchBall')) sound.add('touchBall', './sound/touchBall.mp3');

		//Init Ball
		container.addChild(this._initBall(10, 0x1aff00));
		this._ball.x = this.root.width / 2;
		this._ball.y = this.root.height / 2;

		//Init Pad A
		container.addChild(this._initPad(this._padBot, 100, 10, defaultColor));
		this._padBot.x = this.root.width / 2;
		this._padBot.y = (this.root.height * 10) / 100;

		//Init Pad B
		container.addChild(this._initPad(this._padPlayer, 100, 10, defaultColor));
		this._padPlayer.x = this.root.width / 2;
		this._padPlayer.y = (this.root.height * 90) / 100;

		//Init Score Text
		container.addChild(this._initScoreText());
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;

		this._exitMenu = this._initExitMenu();
		container.addChild(this._exitMenu);
	}

	public onUpdate() {
		if (!this._exitBool) {
			this._botMove();
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
			this.root.loadScene(new SceneWinOrLoose(this.root));
		} else if (this._data.player2_score === this.root.amountVictory) {
			this.root.playerAWin = false;
			this.root.loadScene(new SceneWinOrLoose(this.root));
		}
	}

	public onFinish() {}

	public onKeyDown(e: KeyboardEvent) {
		this._keysPressed[e.code] = true;

		if (e.code === 'Escape' && !this._escapeKeyPressed) {
			this._escapeKeyPressed = true;
			this._exitBool = !this._exitBool;
			this._exitMenu.visible = this._exitBool;
			console.log('Escape ' + (this._exitBool ? 'true' : 'false'));
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

	private _initBall(size: number, color: number) {
		const pourcentage = 3;
		const newWidth = Math.floor((this.root.width * pourcentage) / 100);
		const ratio = 1;
		const newHigth = Math.floor(newWidth / ratio);

		this._ball.beginFill(color);
		this._ball.drawRect(0, 0, newWidth, newHigth);
		this._ball.filters = [glowFilter];
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
		pad.filters = [glowFilter];
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
			sound.play('touchBall');
		}

		// Pad colision
		if (
			this._ball.x > this._padBot.x - this._padBot.width / 2 &&
			this._ball.x < this._padBot.x + this._padBot.width / 2
		) {
			if (this._ball.y <= this._padBot.y + this._padBot.height / 2 + 1) {
				sound.play('touchPad');
				this._data.ballVelocity.y = -this._data.ballVelocity.y;
				this._data.ballVelocity.x = ((this._ball.x - this._padBot.x) / (this._padBot.width / 2)) * 5;
			}
		}
		if (
			this._ball.x > this._padPlayer.x - this._padPlayer.width / 2 &&
			this._ball.x < this._padPlayer.x + this._padPlayer.width / 2
		) {
			if (this._ball.y + this._ball.height / 2 >= this._padPlayer.y - this._padPlayer.height - 1) {
				sound.play('touchPad');
				this._data.ballVelocity.x = ((this._ball.x - this._padPlayer.x) / (this._padPlayer.width / 2)) * 5;
				this._data.ballVelocity.y = -this._data.ballVelocity.y;
			}
		}
	}

	private _checkTurn() {
		// turn player or computer

		if (this._playerTurn) {
			// ball position
			if (this._ball.x - this._ball.width / 2 < this._padPlayer.x - this._padPlayer.width / 2) {
				this._ball.x = this._padPlayer.x - this._padPlayer.width / 2;
			} else if (this._ball.x + this._ball.width / 2 > this._padPlayer.x + this._padPlayer.width / 2) {
				this._ball.x = this._padPlayer.x + this._padPlayer.width / 2 - this._ball.width;
			}
			this._data.ballVelocity.x = ((this._ball.x - this._padPlayer.x) / (this._padPlayer.width / 2)) * 5;
			this._ball.y = this._padPlayer.y - this._padPlayer.height / 2 - this._ball.height * 2;
		} else {
			// ball position
			this._botStart();
			if (this._ball.x - this._ball.width / 2 < this._padBot.x - this._padBot.width / 2) {
				this._ball.x = this._padBot.x - this._padBot.width / 2 - this._ball.width / 2;
			} else if (this._ball.x + this._ball.width / 2 > this._padBot.x + this._padBot.width / 2) {
				this._ball.x = this._padBot.x + this._padBot.width / 2 - this._ball.width / 2;
			}
			this._data.ballVelocity.x = ((this._ball.x - this._padBot.x) / (this._padBot.width / 2)) * 5;
			this._ball.y = this._padBot.y - this._padBot.height / 2 + this._ball.height * 2;
		}
	}

	private _updatePadPosition() {
		if (!this._exitBool) {
			// player movement right
			if (this._keysPressed['ArrowRight']) {
				if (!(this._padPlayer.x + this._padPlayer.width / 2 > this.root.width)) {
					this._padPlayer.x += 10;
				}
			}

			// player movement left
			if (this._keysPressed['ArrowLeft']) {
				if (!(this._padPlayer.x - this._padPlayer.width / 2 < 0)) {
					this._padPlayer.x -= 10;
				}
			}

			// start with space
			if (this._keysPressed['Space']) {
				if (this._gameStarted == false) this._gameStarted = true;
				console.log('press space ' + this._gameStarted);
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
		if (this._ball.y < 10 || this._ball.y < this._padBot.y) {
			console.log('Player win !');
			this._data.ballVelocity.x = 0;
			this._data.ballVelocity.y = 5;
			this._padPlayer.x = this.root.width / 2;
			this._padBot.x = this.root.width / 2;
			this._ball.x = this._padPlayer.x;
			this._gameStarted = false;
			this._playerTurn = false;
			this._data.player1_score++;
			this._updateScoreText();
		}
		if (this._ball.y > this.root.height - 10 || this._ball.y > this._padPlayer.y) {
			console.log('Bot win !');
			this._data.ballVelocity.x = 0;
			this._data.ballVelocity.y = 5;
			this._padPlayer.x = this.root.width / 2;
			this._padBot.x = this.root.width / 2;
			this._ball.x = this._padPlayer.x;
			this._gameStarted = false;
			this._playerTurn = true;
			this._data.player2_score++;
			this._updateScoreText();
		}
	}

	private _updateScoreText() {
		this._scoreText.text = this._data.player1_score + ' - ' + this._data.player2_score;
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;
		this._scoreText.alpha = 0.2;
	}

	private _botStart() {
		if (this._botStarting) return;

		this._botStarting = true;
		let targetX = Math.random() * this.root.width;
		// let targetX = this.root.width;
		if (targetX < this._padBot.width / 2) targetX = this._padBot.width / 2;
		else if (targetX > this.root.width - this._padBot.width / 2)
			targetX = this.root.width - this._padBot.width / 2;
		const duration = 1;
		const ease = 'expo.Out';

		gsap.to(this._padBot, {
			x: targetX,
			duration: duration,
			ease: ease,
			onComplete: () => {
				this._gameStarted = true;
				this._botStarting = false;
			},
		});
	}

	private _botMove() {
		if (
			this._padBot.x + this._padBot.width / 2 < this.root.width &&
			this._ball.x + this._ball.width / 2 > this._padBot.x + this._padBot.width / 2
		)
			this._padBot.x += (this._ball.x - this._padBot.x) * this._botLvl;
		else if (
			this._padBot.x - this._padBot.width / 2 > 0 &&
			this._ball.x - this._ball.width / 2 < this._padBot.x - this._padBot.width / 2
		)
			this._padBot.x += (this._ball.x - this._padBot.x) * this._botLvl;
	}

	private _initExitMenu(): PIXI.Container {
		const menu = new PIXI.Container();

		const background = new PIXI.Graphics();
		background.filters = [glowFilter];
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
		this._exitText.filters = [glowFilter];
		menu.addChild(this._exitText);

		this._yesOption = new PIXI.Text('Yes', { fill: defaultColor });
		this._yesOption.x = background.x - (background.width / 2 + this._yesOption.width / 2) - 50;
		this._yesOption.y = background.y - 50;
		this._yesOption.filters = [glowFilter];
		menu.addChild(this._yesOption);

		this._noOption = new PIXI.Text('No', { fill: 0x053100 });
		this._noOption.x = background.x - (background.width / 2 + this._noOption.width / 2) + 50;
		this._noOption.y = background.y - 50;
		this._noOption.filters = [glowFilter];
		menu.addChild(this._noOption);

		menu.visible = false;

		return menu;
	}
}
