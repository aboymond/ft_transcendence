import type { SceneBase } from './scenes/SceneBase';
// import { jQuery as $ } from 'jquery'
import * as PIXI from 'pixi.js';
import '../src/styles/GameWindow.module.css';
import $ from 'jquery';
import { GameState } from '../src/types';
import { SceneGame } from './scenes/SceneGame';
import { SceneMenu } from './scenes/SceneMenu';
import { SceneWinOrLoose } from './scenes/SceneWinOrLoose';
import { sound } from '@pixi/sound';

interface IPixiManagerOptions {
	backgroundAlpha: number;
	antialias: boolean;
}

interface Tournament {
	name: string;
	id: number;
	max_score: number;
	max_participants: number;
	status: string;
	participants: string[];
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
	public fpsText: PIXI.Text;
	public rpsText: PIXI.Text;
	public currentTournament: Tournament | null = null;

	//--------------------------

	private _currentScene?: SceneBase = undefined;
	private _app: PIXI.Application;
	private UpdateInterval: number = 500;
	private lastFpsUpdateTime: number = 0;
	private lastPingUpdateTime: number = 0;

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

		this.fpsText = new PIXI.Text('FPS: 0', { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff });
		this.fpsText.x = 10; // Position the text object
		this.fpsText.y = 10;
		this._app.stage.addChild(this.fpsText);
		this.rpsText = new PIXI.Text('RPS: 0', { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff });
		this.rpsText.x = 10;
		this.rpsText.y = 40;
		this._app.stage.addChild(this.rpsText);

		this._app.ticker.add((delta) => {
			if (this._currentScene === undefined) return;
			this._currentScene.onUpdate(delta);

			const currentTime = performance.now();
			if (currentTime - this.lastFpsUpdateTime > this.UpdateInterval) {
				const fps = this._app.ticker.FPS;
				this.fpsText.text = 'FPS: ' + fps.toFixed(0);
				this.lastFpsUpdateTime = currentTime;
			}
		});
		window.addEventListener('keydown', this._onKeyDownBind);
		window.addEventListener('keyup', this._onKeyUpBind);
		// window.addEventListener('resize', this.handleResize.bind(this));
		$('#game_window').append(this._app.view as unknown as HTMLElement);

		if (!sound.exists('select')) sound.add('select', './sound/Select.mp3');
		if (!sound.exists('enter')) sound.add('enter', './sound/game-start.mp3');
		if (!sound.exists('win')) sound.add('win', './sound/Winner.mp3');
		if (!sound.exists('loose')) sound.add('loose', './sound/Looser.mp3');
		if (!sound.exists('touchPad')) sound.add('touchPad', './sound/touchPad.mp3');
		if (!sound.exists('touchBall')) sound.add('touchBall', './sound/touchBall.mp3');
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

		this._app.stage.addChild(this.fpsText);
		this._app.stage.addChild(this.rpsText);
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

	public getCurrentScene(): SceneBase | undefined {
		return this._currentScene;
	}

	public setCurrentScene(scene: SceneBase | undefined): void {
		this._currentScene = scene;
	}

	public openGameSocket(gameId: number) {
		const gameSocketUrl = `ws://localhost:8000/ws/game/${gameId}/`;
		this.gameSocket = new WebSocket(gameSocketUrl);
		let lastUpdateTime = 0;
		let pingSum = 0;
		let pingCount = 0;

		this.gameSocket.onopen = () => {
			console.log('Game WebSocket opened:', gameId);
			lastUpdateTime = performance.now();
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
					{
						const currentTime = performance.now();
						const timeDiff = currentTime - lastUpdateTime;
						pingSum += timeDiff;
						pingCount++;
						lastUpdateTime = currentTime;

						if (currentTime - this.lastPingUpdateTime > this.UpdateInterval) {
							const rps = 1000 / (pingSum / pingCount);
							this.rpsText.text = `RPS: ${rps.toFixed(0)}`;
							this.lastPingUpdateTime = currentTime;
							pingSum = 0;
							pingCount = 0;
						}
					}
					this.gameState = {
						ballPosition: { x: data.ball_x, y: data.ball_y },
						pad1: { x: data.pad1_x, y: data.pad1_y },
						pad2: { x: data.pad2_x, y: data.pad2_y },
						player1_score: data.player1_score,
						player2_score: data.player2_score,
						ballVelocity: { x: data.ball_velocity_x, y: data.ball_velocity_y },
						playerTurn: data.player_turn,
						winWidth: this.width, //TODO: check if needed
						winHeight: this.height, //TODO: check if needed
					};
					break;
				case 'leave_game':
					if (data.winner_id === this.userId) {
						console.log('The other player has left the game. You won!');
						this.playerAWin = true;
						this.loadScene(new SceneWinOrLoose(this));
					} else if (data.loser_id === this.userId) {
						this.playerAWin = false;
						console.log('You left the game. You lost!');
						this.loadScene(new SceneWinOrLoose(this));
					} else {
						this.loadScene(new SceneMenu(this));
					}
					if (this.gameSocket) {
						this.gameSocket.close();
					}
					break;
				case 'end_game':
					if (data.winner_id === this.userId) {
						console.log('You won!');
						this.playerAWin = true;
						this.loadScene(new SceneWinOrLoose(this));
					} else {
						this.playerAWin = false;
						console.log('You lost!');
						this.loadScene(new SceneWinOrLoose(this));
					}
					if (this.gameSocket) {
						this.gameSocket.close();
					}
					break;
			}
		});
	}

	public playSound(soundKey: string): void {
		if (sound.exists(soundKey)) {
			sound.play(soundKey);
		} else {
			console.warn(`Sound key "${soundKey}" does not exist.`);
		}
	}
}
