import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import { textStyleDefaultMenu1, textStyleTitleMenu1 } from '../index';
import { Tools } from '../Tools';
import { AudioManager } from '../AudioManager';
import { SceneTournamentLoadingVs } from './SceneTournamentLoadingVs';
import { apiService } from '../../src/services/apiService';

export class SceneMenu extends SceneBase {
	private _textTitle = new PIXI.Text('PONG', textStyleTitleMenu1);
	private _spaceText = new PIXI.Text('PRESS ENTER TO START', textStyleDefaultMenu1);
	private _interval = 0;

	public async onStart(container: PIXI.Container) {
		try {
			// const gameResponse = await apiService.getCurrentGame();
			// const gameId = gameResponse.length > 0 ? gameResponse[0].id : null;
			// if (gameId) {
			// 	this.root.openGameSocket(gameId);
			// 	return;
			// }

			const tournamentResponse = await apiService.getCurrentTournament();
			const tournamentId = tournamentResponse.length > 0 ? tournamentResponse[0].id : null;
			if (tournamentId) {
				this.root.loadScene(new SceneTournamentLoadingVs(this.root, tournamentId));
				return;
			}
		} catch (e) {
			console.log('No tournament found');
		}

		container.addChild(this._initTextTitle(this._textTitle));
		container.addChild(this._initTextSpace(this._spaceText));

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
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Enter') {
			AudioManager.play('enter');
			this.root.loadScene(new SceneMenu2(this.root));
		}
	}

	public onKeyUp() {}

	private _initTextTitle(title: PIXI.Text) {
		title = Tools.resizeText(title, this.root.width, 80);

		const anchorX = title.width / 2;
		const anchorY = title.height / 2;

		title.x = this.root.width / 2 - anchorX;
		title.y = ((this.root.height - anchorY) * 25) / 100;
		return title;
	}

	private _initTextSpace(title: PIXI.Text) {
		title = Tools.resizeText(title, this.root.width, 20);

		const anchorX = title.width / 2;
		const anchorY = title.height / 2;

		title.x = this.root.width / 2 - anchorX;
		title.y = ((this.root.height - anchorY) * 80) / 100;
		return title;
	}
}
