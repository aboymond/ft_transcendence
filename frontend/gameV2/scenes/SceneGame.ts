import * as PIXI from 'pixi.js';
import { defaultColor, glowFilter } from '..';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { SceneWinOrLoose } from './SceneWinOrLoose';
import { gsap } from 'gsap';
import { PixiManager } from '../PixiManager';
import { apiService } from '../../src/services/apiService';
// import { GameState } from '../../src/types';

export class SceneGame extends SceneBase {
	// FOR THE BACK ======================================
	private _data = {
		ballVelocity: { x: 0, y: 5 },
		player1_score: 0,
		player2_score: 0,
		playerTurnA: Math.random() < 0.5,
	};

	// private _botLvl = this.root.botLvl;
	private _gameStarted = false;
	private _player1_turn = true;
	private _player2_turn = false;
	private _exitBool = false;
	private _exitYesNO = true;
	//==========================================================

	private _ball = new PIXI.Graphics();
	private _pad1 = new PIXI.Graphics();
	private _pad2 = new PIXI.Graphics();
	private _scoreText = new PIXI.Text('0 - 0', { fill: defaultColor });
	private _keysPressed: { [key: string]: boolean } = {};
	private _escapeKeyPressed = false;

	private _exitMenu = new PIXI.Container();
	private _yesOption!: PIXI.Text;
	private _noOption!: PIXI.Text;
	private _exitText!: PIXI.Text;

	// private messageHandler: (this: WebSocket, ev: MessageEvent) => void;

	constructor(
		public root: PixiManager,
		private _gameId: number,
	) {
		super(root);
	}

	//=======================================
	// HOOK
	//=======================================

	//TODO init state in backend
	public async onStart(container: PIXI.Container) {
		//Init Ball
		container.addChild(this._initBall(10, 0x1aff00));
		this._ball.x = this.root.width / 2;
		this._ball.y = this.root.height / 2;

		//Init Pad 1
		container.addChild(this._initPad(this._pad2, 100, 10, defaultColor));
		this._pad1.x = this.root.width / 2;
		this._pad1.y = this.root.height - 50;

		//Init Pad 2
		container.addChild(this._initPad(this._pad1, 100, 10, defaultColor));
		this._pad2.x = this.root.width / 2;
		this._pad2.y = 50;

		//Init Score Text
		container.addChild(this._initScoreText());
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;

		this._exitMenu = this._initExitMenu();
		container.addChild(this._exitMenu);

		// // Construct initial game state object
		// const initialState: GameState = {
		// 	ballPosition: { x: this._ball.x, y: this._ball.y },
		// 	ballVelocity: { x: this._data.ballVelocity.x, y: this._data.ballVelocity.y },
		// 	pad1: { x: this._pad1.x, y: this._pad1.y },
		// 	pad2: { x: this._pad2.x, y: this._pad2.y },
		// 	player1_score: 0,
		// 	player2_score: 0,
		// 	playerTurn: 1,
		// 	winWidth: this.root.width,
		// 	winHeight: this.root.height,
		// };

		// // Send initial game state to backend
		// try {
		// 	await apiService.initGameState(this._gameId, initialState);
		// 	console.log('Game state initialized in backend');
		// } catch (error) {
		// 	console.error('Error initializing game state in backend', error);
		// }
	}

	public onUpdate() {
		const gameState = this.root.gameState;
		// TODO Use backend gameState to update the game state
		if (gameState) {
			this._data.player1_score = gameState.player1_score;
			this._data.player2_score = gameState.player2_score;
			this._ball.x = gameState.ballPosition.x;
			this._ball.y = gameState.ballPosition.y;
			this._pad1.x = gameState.pad1.x;
			this._pad1.y = gameState.pad1.y;
			this._pad2.x = gameState.pad2.x;
			this._pad2.y = gameState.pad2.y;
		}

		if (!this._exitBool) {
			if (!this._gameStarted) this._checkTurn();
			else {
				//TODO move logic to backend
				this._addVelocity();
				this._checkCollisions();
				this._checkifBallIsOut();
			}
		}
		this._updatePadPosition();

		//TODO end game in backend and set winner
		if (this._data.player1_score === this.root.amountVictory) {
			this.root.playerAWin = true;
			this.root.loadScene(new SceneWinOrLoose(this.root));
		} else if (this._data.player2_score === this.root.amountVictory) {
			this.root.playerAWin = false;
			this.root.loadScene(new SceneWinOrLoose(this.root));
		}
	}

	public onFinish() {
		if (this.root.gameSocket) {
			this.root.gameSocket.close();
			this.root.gameSocket = null;
		}
	}

	public onKeyDown(e: KeyboardEvent) {
		this._keysPressed[e.code] = true;

		if (e.code === 'Escape' && !this._escapeKeyPressed) {
			this._escapeKeyPressed = true;
			this._exitBool = !this._exitBool;
			this._exitMenu.visible = this._exitBool;
			console.log('Escape ' + (this._exitBool ? 'true' : 'false'));
		}

		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
			apiService
				.sendKeyPress(this._gameId, this.root.userId ?? 0, e.code)
				.then((response) => console.log(response))
				.catch((error) => console.error('Error sending key press', error));
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
		this._ball.beginFill(color);
		this._ball.drawRect(0, 0, size, size);
		this._ball.filters = [glowFilter];
		this._ball.endFill();
		return this._ball;
	}

	private _initPad(pad: PIXI.Graphics, width: number, height: number, color: number) {
		pad.beginFill(color);
		pad.drawRect(-width / 2, -height / 2, width, height);
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

	//TODO move logic to backend
	private _addVelocity() {
		if (this._player1_turn) this._ball.y -= this._data.ballVelocity.y;
		else this._ball.y += this._data.ballVelocity.y;
		this._ball.x += this._data.ballVelocity.x;
	}

	//TODO move logic to backend
	private _checkCollisions() {
		// Wall colision
		if (this._ball.x <= 1 || this._ball.x + this._ball.width / 2 >= this.root.width - 1)
			this._data.ballVelocity.x = -this._data.ballVelocity.x;

		// Pad colision
		if (
			this._ball.x > this._pad2.x - this._pad2.width / 2 &&
			this._ball.x < this._pad2.x + this._pad2.width / 2
		) {
			if (this._ball.y <= this._pad2.y + this._pad2.height / 2 + 1) {
				this._data.ballVelocity.y = -this._data.ballVelocity.y;
				this._data.ballVelocity.x = ((this._ball.x - this._pad2.x) / (this._pad2.width / 2)) * 5;
			}
		}
		if (
			this._ball.x > this._pad1.x - this._pad1.width / 2 &&
			this._ball.x < this._pad1.x + this._pad1.width / 2
		) {
			if (this._ball.y >= this._pad1.y - this._pad1.height - 1) {
				this._data.ballVelocity.x = ((this._ball.x - this._pad1.x) / (this._pad1.width / 2)) * 5;
				this._data.ballVelocity.y = -this._data.ballVelocity.y;
			}
		}
	}

	//TODO move logic to backend
	private _checkTurn() {
		// turn player or computer

		if (this._player1_turn) {
			// ball position
			if (this._ball.x - this._ball.width / 2 < this._pad1.x - this._pad1.width / 2) {
				this._ball.x = this._pad1.x - this._pad1.width / 2 - this._ball.width / 2;
			} else if (this._ball.x + this._ball.width / 2 > this._pad1.x + this._pad1.width / 2) {
				this._ball.x = this._pad1.x + this._pad1.width / 2 - this._ball.width / 2;
			}
			this._data.ballVelocity.x = ((this._ball.x - this._pad1.x) / (this._pad1.width / 2)) * 5;
			this._ball.y = this._pad1.y - this._pad1.height / 2 - this._ball.height * 2;
		} else {
			// ball position
			this._player2Start();
			if (this._ball.x - this._ball.width / 2 < this._pad2.x - this._pad2.width / 2) {
				this._ball.x = this._pad2.x - this._pad2.width / 2 - this._ball.width / 2;
			} else if (this._ball.x + this._ball.width / 2 > this._pad2.x + this._pad2.width / 2) {
				this._ball.x = this._pad2.x + this._pad2.width / 2 - this._ball.width / 2;
			}
			this._data.ballVelocity.x = ((this._ball.x - this._pad2.x) / (this._pad2.width / 2)) * 5;
			this._ball.y = this._pad2.y - this._pad2.height / 2 + this._ball.height * 2;
		}
	}

	//TODO move logic to backend
	private _updatePadPosition() {
		if (!this._exitBool) {
			// player movement right
			if (this._keysPressed['ArrowRight']) {
				if (!(this._pad1.x + this._pad1.width / 2 > this.root.width)) {
					this._pad1.x += 10;
				}
			}

			// player movement left
			if (this._keysPressed['ArrowLeft']) {
				if (!(this._pad1.x - this._pad1.width / 2 < 0)) {
					this._pad1.x -= 10;
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
					//TODO send exit to backend
					this.root.loadScene(new SceneMenu(this.root));
				} else {
					this._exitBool = false;
					this._exitMenu.visible = false;
				}
			}
		}
	}

	//TODO move logic to backend
	private _checkifBallIsOut() {
		if (this._ball.y < 10 || this._ball.y < this._pad2.y) {
			console.log('Player 1 scores !');
			this._data.ballVelocity.x = 0;
			this._data.ballVelocity.y = 5;
			this._pad1.x = this.root.width / 2;
			this._pad2.x = this.root.width / 2;
			this._ball.x = this._pad1.x;
			this._gameStarted = false;
			this._player1_turn = false;
			this._data.player1_score++;
			this._updateScoreText();
		}
		if (this._ball.y > this.root.height - 10 || this._ball.y > this._pad1.y) {
			console.log('Player 2 scores !');
			this._data.ballVelocity.x = 0;
			this._data.ballVelocity.y = 5;
			this._pad1.x = this.root.width / 2;
			this._pad2.x = this.root.width / 2;
			this._ball.x = this._pad1.x;
			this._gameStarted = false;
			this._player1_turn = true;
			this._data.player2_score++;
			this._updateScoreText();
		}
		// console.log('X in GO = ' + this._data.ballVelocity.x);
		// console.log('Y in GO = ' + this._data.ballVelocity.y);
	}

	private _updateScoreText() {
		this._scoreText.text = this._data.player1_score + ' - ' + this._data.player2_score;
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;
		this._scoreText.alpha = 0.2;
	}

	private _player2Start() {
		if (this._player2_turn) return;

		this._player2_turn = true;
		let targetX = Math.random() * this.root.width;
		// let targetX = this.root.width;
		if (targetX < this._pad2.width / 2) targetX = this._pad2.width / 2;
		else if (targetX > this.root.width - this._pad2.width / 2)
			targetX = this.root.width - this._pad2.width / 2;
		const duration = 1;
		const ease = 'expo.Out';

		gsap.to(this._pad2, {
			x: targetX,
			duration: duration,
			ease: ease,
			onComplete: () => {
				this._gameStarted = true;
				this._player2_turn = false;
			},
		});
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
