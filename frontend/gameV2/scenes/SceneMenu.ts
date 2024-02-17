import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import { textStyleDefaultMenu1, textStyleTitleMenu1 } from '../index';
import {AudioManager} from '../AudioManager';

export class SceneMenu extends SceneBase {
	private _textTitle = new PIXI.Text('PONG', textStyleTitleMenu1);
	private _spaceText = new PIXI.Text('PRESS ENTER TO START', textStyleDefaultMenu1);
	private _interval = 0;

	public async onStart(container: PIXI.Container) {
		// AudioManager.loadAll();
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
