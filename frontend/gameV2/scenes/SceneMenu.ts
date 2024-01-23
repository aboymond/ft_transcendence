import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import { glowFilter, textStyleDefaultMenu1, textStyleTitleMenu1 } from '../index';

export class SceneMenu extends SceneBase {
	private _textTitle = new PIXI.Text('PONG', textStyleTitleMenu1);
	private _spaceText = new PIXI.Text('PRESS ENTER TO START', textStyleDefaultMenu1);
	private _interval = 0;

	public async onStart(container: PIXI.Container) {
		//Init Title text
		container.addChild(this._initTextTitle());
		this._textTitle.x = this.root.width / 2 - this._textTitle.width / 2;
		this._textTitle.y = this.root.height / 2 / 2 - this._textTitle.height / 2;

		//Init Space text
		container.addChild(this._initTextSpace());
		this._spaceText.x = this.root.width / 2 - this._spaceText.width / 2;
		this._spaceText.y = this.root.height - 100 - this._spaceText.height / 2;

		this._interval = setInterval(() => {
			if (this._spaceText) {
				this._spaceText.visible = !this._spaceText.visible;
			}
			// console.log(this._spaceText);
		}, 800);
		console.log('width: ' + this.root.width);
		console.log('height: ' + this.root.height);
	}

	public onUpdate() {}

	public onFinish() {
		clearInterval(this._interval);
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Enter') this.root.loadScene(new SceneMenu2(this.root));
	}

	public onKeyUp() {}

	private _initTextTitle() {
		this._textTitle.filters = [glowFilter];
		return this._textTitle;
	}

	private _initTextSpace() {
		this._spaceText.filters = [glowFilter];
		return this._spaceText;
	}
}
