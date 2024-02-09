import * as PIXI from 'pixi.js';
import { defaultColor, glowFilter } from '..';
import { SceneBase } from './SceneBase';
import { PixiManager } from '../PixiManager';
import { apiService } from '../../src/services/apiService';

export class SceneGame extends SceneBase {
	// FOR THE BACK ======================================
	private _data = {
		ballVelocity: { x: 0, y: 5 },
		player1_score: 0,
		player2_score: 0,
		playerTurnA: Math.random() < 0.5,
	};

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

	private _accumulator = 0;
	private _sendInterval = 1 / 60;

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

		await this.notifyPlayerReady();
	}

	public onUpdate(delta: number) {
		this._accumulator += delta * (1000 / 60);

		if (this._accumulator >= this._sendInterval) {
			this._accumulator -= this._sendInterval;

			const keysOfInterest = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'];
			const pressedKeys = keysOfInterest.filter((key) => this._keysPressed[key]);

			if (pressedKeys.length > 0) {
				pressedKeys.forEach((key) => {
					apiService
						.sendKeyPress(this._gameId, this.root.userId ?? 0, key)
						.then((response) => console.log(`${key} press response:`, response))
						.catch((error) => console.error(`Error sending ${key} press`, error));
				});
			}
		}

		const gameState = this.root.gameState;
		if (gameState) {
			this._ball.x = gameState.ballPosition.x;
			this._ball.y = gameState.ballPosition.y;
			this._data.player1_score = gameState.player1_score;
			this._data.player2_score = gameState.player2_score;
			this._pad1.x = gameState.pad1.x;
			this._pad1.y = gameState.pad1.y;
			this._pad2.x = gameState.pad2.x;
			this._pad2.y = gameState.pad2.y;
		}

		this._updateScoreText();
		this._handleExit();
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

	// //TODO move logic to backend
	// private _checkTurn() {
	// 	// turn player or computer

	// 	if (this._player1_turn) {
	// 		// ball position
	// 		if (this._ball.x - this._ball.width / 2 < this._pad1.x - this._pad1.width / 2) {
	// 			this._ball.x = this._pad1.x - this._pad1.width / 2 - this._ball.width / 2;
	// 		} else if (this._ball.x + this._ball.width / 2 > this._pad1.x + this._pad1.width / 2) {
	// 			this._ball.x = this._pad1.x + this._pad1.width / 2 - this._ball.width / 2;
	// 		}
	// 		this._data.ballVelocity.x = ((this._ball.x - this._pad1.x) / (this._pad1.width / 2)) * 5;
	// 		this._ball.y = this._pad1.y - this._pad1.height / 2 - this._ball.height * 2;
	// 	} else {
	// 		// ball position
	// 		this._player2Start();
	// 		if (this._ball.x - this._ball.width / 2 < this._pad2.x - this._pad2.width / 2) {
	// 			this._ball.x = this._pad2.x - this._pad2.width / 2 - this._ball.width / 2;
	// 		} else if (this._ball.x + this._ball.width / 2 > this._pad2.x + this._pad2.width / 2) {
	// 			this._ball.x = this._pad2.x + this._pad2.width / 2 - this._ball.width / 2;
	// 		}
	// 		this._data.ballVelocity.x = ((this._ball.x - this._pad2.x) / (this._pad2.width / 2)) * 5;
	// 		this._ball.y = this._pad2.y - this._pad2.height / 2 + this._ball.height * 2;
	// 	}
	// }

	private async _handleExit() {
		if (this._exitBool) {
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
					// Call the API to end the game
					try {
						await apiService.leaveGame(this._gameId);
					} catch (error) {
						console.error('Error leaving game:', error);
					}
					// Navigate back to the menu
					// this.root.loadScene(new SceneMenu(this.root));
				} else {
					this._exitBool = false;
					this._exitMenu.visible = false;
				}
			}
		}
	}
	private _updateScoreText() {
		this._scoreText.text = this._data.player1_score + ' - ' + this._data.player2_score;
		this._scoreText.x = this.root.width / 2 - this._scoreText.width / 2;
		this._scoreText.y = this.root.height / 2 - this._scoreText.height / 2;
		this._scoreText.alpha = 0.2;
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

	private async notifyPlayerReady() {
		try {
			await apiService.sendPlayerReady(this._gameId);
		} catch (error) {
			console.error('Error notifying player ready:', error);
		}
	}
}
