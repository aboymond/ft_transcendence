import type { SceneBase } from './scenes/SceneBase';
import $ from 'jquery';
import * as PIXI from 'pixi.js';

export interface IPixiManagerOptions {
	backgroundAlpha: number;
	antialias: boolean;
}

export class PixiManager {
	public vsPlayer = false;
	public amountVictory = 5;
	public botLvl = 0.05;
	public playerAWin = true;
	public gameId?: string;
	public view: HTMLCanvasElement | PIXI.ICanvas;

	private _currentScene?: SceneBase = undefined;
	private _app: PIXI.Application;
	private _socket?: WebSocket;

	constructor(readonly options: Partial<IPixiManagerOptions> = {}) {
		PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;

		this._app = new PIXI.Application({
			width: this.width,
			height: this.height,
			backgroundAlpha: options.backgroundAlpha ?? 0,
			antialias: options.antialias ?? true,
		});

		this.view = this._app.view; // Assign the PIXI view to the public view property

		this._app.ticker.add((delta) => {
			if (this._currentScene === undefined) return;
			this._currentScene.onUpdate(delta);
		});
		window.addEventListener('keydown', this._onKeyDownBind);
		window.addEventListener('keyup', this._onKeyUpBind);
		$('#game_window').append(this._app.view as any);
	}

	public destroy() {
		window.removeEventListener('keydown', this._onKeyDownBind);
		window.removeEventListener('keyup', this._onKeyUpBind);
		this._app.destroy(true);

		// Close WebSocket connection
		if (this._socket) {
			this._socket.close();
		}
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

		// Open WebSocket connection
		this._socket = new WebSocket('ws://localhost/ws/game/' + this.gameId + '/');
		this._socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (this._currentScene !== undefined) {
				this._currentScene.updateState(data);
			}
		};
		this._socket.onclose = (event) => {
			console.log('WebSocket closed', event);
		};
	}

	private _unmountedScene() {
		if (this._currentScene === undefined) return;
		this._currentScene.onFinish();
		this._app.stage.removeChildren();
	}

	public get width() {
		return $('#game_window').width();
	}

	public get height() {
		return $('#game_window').height();
	}
}

export default PixiManager;
