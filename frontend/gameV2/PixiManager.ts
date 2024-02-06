import type { SceneBase } from './scenes/SceneBase';
// import { jQuery as $ } from 'jquery'
import * as PIXI from 'pixi.js';
import '../src/styles/GameWindow.module.css';
import $ from 'jquery';
import { GameState } from '../src/types';
import { SceneGame } from './scenes/SceneGame';

interface IPixiManagerOptions {
	backgroundAlpha: number;
	antialias: boolean;
}

export class PixiManager {
	//For the back -------------
	public vsPlayer = false;
	public amountVictory = 5;
	public botLvl = 0.05;
	public playerAWin = true;
	public ws: WebSocket | null;
	public gameSocket: WebSocket | null = null;
	public gameState: GameState | null = null;
	public userId: number | null = null;

	//--------------------------

	private _currentScene?: SceneBase = undefined;
	private _app: PIXI.Application;

	constructor(
		readonly options: Partial<IPixiManagerOptions> = {},
		ws: WebSocket | null,
		userId: number | null = null,
	) {
		this.ws = ws;
		PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;
		this.userId = userId;

		this._app = new PIXI.Application({
			width: this.width,
			height: this.height,
			backgroundAlpha: options.backgroundAlpha ?? 0,
			antialias: options.antialias ?? true,
		});
		this._app.ticker.add((delta) => {
			if (this._currentScene === undefined) return;
			this._currentScene.onUpdate(delta); //? TODO
		});
		window.addEventListener('keydown', this._onKeyDownBind);
		window.addEventListener('keyup', this._onKeyUpBind);
		// window.addEventListener('resize', this.handleResize.bind(this));
		$('#game_window').append(this._app.view as unknown as HTMLElement);
	}

	public destroy() {
		window.removeEventListener('keydown', this._onKeyDownBind);
		window.removeEventListener('keyup', this._onKeyUpBind);
		// window.removeEventListener('resize', this.handleResize.bind(this));
		this._app.destroy(true);
	}

	private _onKeyDownBind = this._onKeyDown.bind(this);
	private _onKeyDown(e: KeyboardEvent) {
		if (this._currentScene === undefined) return;
		this._currentScene.onKeyDown(e);
	}

	private _onKeyUpBind = this._onKeyUp.bind(this);
	private _onKeyUp(e: KeyboardEvent) {
		if (this._currentScene === undefined) return;
		this._currentScene.onKeyUp(e);
	}

	public loadScene(scene: SceneBase) {
		this._unmountedScene();
		const container = new PIXI.Container();

		this._currentScene = scene;
		this._app.stage.addChild(container);
		this._currentScene.onStart(container);
	}

	private _unmountedScene() {
		if (this._currentScene === undefined) return;
		this._currentScene.onFinish();
		this._app.stage.removeChildren();
	}

	public get width() {
		const winWidth = 600;
		const gameWindow = document.getElementById('game_window');
		return gameWindow ? gameWindow.clientWidth : winWidth;
	}

	public get height() {
		const winHeight = 800;
		const gameWindow = document.getElementById('game_window');
		return gameWindow ? gameWindow.clientHeight : winHeight;
	}

	// //TODO: check if needed
	// public adjustGameView(gameWidth: number, gameHeight: number) {
	// 	// Adjust the PIXI.Application size to fit the standardized game dimensions
	// 	// while maintaining aspect ratio
	// 	const scaleX = window.innerWidth / gameWidth;
	// 	const scaleY = window.innerHeight / gameHeight;
	// 	const scaleToFit = Math.min(scaleX, scaleY);

	// 	this._app.renderer.resize(gameWidth * scaleToFit, gameHeight * scaleToFit);
	// 	// Additional adjustments as needed to center the game view, etc.
	// }

	// //TODO: check if needed
	// private handleResize() {
	// 	console.log('Resizing game window');
	// 	if (this.gameState) {
	// 		this.adjustGameView(this.gameState.winWidth, this.gameState.winHeight);
	// 	}
	// }

	public openGameSocket(gameId: number) {
		const gameSocketUrl = `ws://localhost:8000/ws/game/${gameId}/`;
		this.gameSocket = new WebSocket(gameSocketUrl);

		this.gameSocket.onopen = () => {
			console.log('Game WebSocket opened:', gameId);
		};

		this.gameSocket.addEventListener('message', (event) => {
			const message = JSON.parse(event.data);

			const { action, data } = message; // Directly destructure action and data
			switch (action) {
				case 'start_game':
					console.log('Starting SceneGame');
					this.loadScene(new SceneGame(this, gameId));
					break;
				case 'game_state_update':
					console.log('Received game state update:', data);
					this.gameState = {
						ballPosition: { x: data.ball_x, y: data.ball_y },
						pad1: { x: data.pad1_x, y: data.pad1_y },
						pad2: { x: data.pad2_x, y: data.pad2_y },
						player1_score: data.player1_score,
						player2_score: data.player2_score,
						ballVelocity: { x: data.ball_velocity_x, y: data.ball_velocity_y },
						playerTurnA: data.playerTurnA,
						winWidth: this.width,
						winHeight: this.height,
					};
					break;
			}
		});
	}
}
