import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import { textStyleDefaultMenu1, textStyleTitleMenu1 } from '../index';
import {AudioManager} from '../AudioManager';
import { SceneTournamentLoadingVs } from './SceneTournamentLoadingVs';
import { apiService } from '../../src/services/apiService';
import { SceneLoadingPage } from './SceneLoadingPage';


export class SceneMenu extends SceneBase {
	private _textTitle = new PIXI.Text('PONG', textStyleTitleMenu1);
	private _spaceText = new PIXI.Text('PRESS ENTER TO START', textStyleDefaultMenu1);
	private _interval = 0;

	public async onStart(container: PIXI.Container) {
		try {
			const gameResponse = await apiService.getCurrentGame();
			const gameId = gameResponse.length > 0 ? gameResponse[0].id : null;
			if (gameId) {
				this.root.loadScene(new SceneLoadingPage(this.root, gameId));
				return;
			}

			const tournamentResponse = await apiService.getCurrentTournament();
			const tournamentId = tournamentResponse.length > 0 ? tournamentResponse[0].id : null;
			if (tournamentId) {
				this.root.loadScene(new SceneTournamentLoadingVs(this.root, tournamentId));
				return;
			}
		} catch (error) {
			console.error('Error fetching current tournament or game:', error);
			this.root.loadScene(new SceneMenu2(this.root));
		}

		// //Init Title text
		// this._textTitle.eventMode = 'dynamic';
		// this._textTitle.cursor = 'pointer';
		// this._textTitle.on('pointerdown', () => {
		// 	this.root.playSound('enter');
		// 	this.root.loadScene(new SceneMenu2(this.root));
		// });

		container.addChild(this._initTextTitle());
		this._textTitle.x = this.root.width / 2 - this._textTitle.width / 2;
		this._textTitle.y = this.root.height / 2 / 2 - this._textTitle.height / 2;

		container.addChild(this._initTextSpace());
		this._spaceText.x = this.root.width / 2 - this._spaceText.width / 2;
		this._spaceText.y = this.root.height - 100 - this._spaceText.height / 2;

		this._interval = window.setInterval(() => {
			if (this._spaceText) {
				this._spaceText.visible = !this._spaceText.visible;
			}
		}, 800);
	}

	public onUpdate() {}

	public onFinish() {
		clearInterval(this._interval);
		AudioManager.reset();
		// this.root.removeSound('loading');
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Enter') {
			AudioManager.play('enter');
			this.root.loadScene(new SceneMenu2(this.root));
		}
	}

	public onKeyUp() {}

	private _initTextTitle() {
		return this._textTitle;
	}

	private _initTextSpace() {
		return this._spaceText;
	}
}
