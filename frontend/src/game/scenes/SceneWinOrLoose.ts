import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import { glowFilter, defaultColor, textStyleWinOrLoose } from '../index';

export class SceneWinOrLoose extends SceneBase {
	private _textWin = new PIXI.Text('YOU WIN', textStyleWinOrLoose);
	private _textLoose = new PIXI.Text('LOOOOOOSER', textStyleWinOrLoose);
	private _interval = 0;
	//=======================================
	// Effects
	//=======================================

	//=======================================
	// HOOK
	//=======================================

	public onStart(container: PIXI.Container) {
		container.addChild(this._initTextWin(this._textWin));
		container.addChild(this._initTextLoose(this._textLoose));

		if (this.root.playerAWin) {
			this._textWin.visible = true;
			this._interval = setInterval(() => {
				if (this._textWin) {
					this._textWin.visible = !this._textWin.visible;
				}
			}, 800);
		} else {
			this._textLoose.visible = true;
			this._interval = setInterval(() => {
				if (this._textLoose) {
					this._textLoose.visible = !this._textLoose.visible;
				}
			}, 800);
		}
	}

	public onUpdate() {}

	public onFinish() {
		clearInterval(this._interval);
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Enter') this.root.loadScene(new SceneMenu2(this.root));
	}

	public onKeyUp() {}

	//=======================================
	// UTILS
	//=======================================

	private _initTextWin(text: PIXI.Text) {
		text.style.fill = defaultColor;
		text.filters = [glowFilter];
		text.style.fontSize = this.root.width * 0.06;
		text.x = this.root.width / 2 - text.width / 2;
		text.y = this.root.height / 2 - text.height / 2;
		text.visible = false;
		return text;
	}

	private _initTextLoose(text: PIXI.Text) {
		text.style.fill = defaultColor;
		text.filters = [glowFilter];
		text.style.fontSize = this.root.width * 0.06;
		text.x = this.root.width / 2 - text.width / 2;
		text.y = this.root.height / 2 - text.height / 2;
		text.visible = false;
		return text;
	}
}
