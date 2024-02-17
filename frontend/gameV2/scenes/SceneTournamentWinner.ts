import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { textStyleDefaultMenu1, textStyleTitleMenu1 } from '../index';
import {AudioManager} from '../AudioManager';

export class SceneTournamentWinner extends SceneBase {
	private _textTitle = new PIXI.Text('WINNER', textStyleTitleMenu1);
	private _nameText = new PIXI.Text('Jean Jacques', textStyleDefaultMenu1);
	private _interval = 0;

	public async onStart(container: PIXI.Container) {
		// AudioManager.loadAll();
		container.addChild(this._initTextTitle());
		container.addChild(this._initTextName());

		this._interval = window.setInterval(() => {
			if (this._textTitle) {
				this._textTitle.visible = !this._textTitle.visible;
			}
		}, 1000);
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
			this.root.loadScene(new SceneMenu(this.root));
		}
	}

	public onKeyUp() {}

	private _initTextTitle() {
		this._textTitle.width = (this.root.width * 90) /100;
		this._textTitle.x = this.root.width / 2 - this._textTitle.width / 2;
		this._textTitle.y = (this.root.height * 25) / 100 - this._textTitle.height / 2;
		return this._textTitle;
	}

	private _initTextName() {
		this._nameText.width = (this.root.width * 50) /100;
		this._nameText.x = (this.root.width * 50) / 100 - this._nameText.width / 2;
		this._nameText.y = (this.root.height * 65) / 100 - this._nameText.height / 2;
		return this._nameText;
	}
}
