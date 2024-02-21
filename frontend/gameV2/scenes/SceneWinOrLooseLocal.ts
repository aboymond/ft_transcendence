import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { defaultColor, textStyleWinOrLoose } from '../index';
import { AudioManager } from '../AudioManager';
import { PixiManager } from '../PixiManager';
import { Tools } from '../Tools';

export class SceneWinOrLooseLocal extends SceneBase {
	constructor(
		public root: PixiManager,
		private _player: string,
	) {
		super(root);
	}

	private _textPlayer = new PIXI.Text('');
	private _textWin = new PIXI.Text('WIN', textStyleWinOrLoose);
	private _interval = 0;
	//=======================================
	// Effects
	//=======================================

	//=======================================
	// HOOK
	//=======================================

	public async onStart(container: PIXI.Container) {
		this._textPlayer.text = this._player;
		container.addChild(this._initTextWin(this._textWin));
		container.addChild(this._initTextPlayer(this._textPlayer));

		AudioManager.play('win');
		this._interval = window.setInterval(() => {
			if (this._textWin) {
				this._textWin.visible = !this._textWin.visible;
			}
		}, 800);
	}

	public onUpdate() {}

	public onFinish() {
		clearInterval(this._interval);
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
			this.root.loadScene(new SceneMenu(this.root));
		}
	}

	public onKeyUp() {}

	//=======================================
	// UTILS
	//=======================================

	private _initTextWin(text: PIXI.Text) {
		text.style.fill = defaultColor;
		text = Tools.resizeText(text, this.root.width, 90);
		text.x = this.root.width / 2 - text.width / 2;
		text.y = ((this.root.height - text.height / 2) * 50) / 100;
		text.visible = true;
		return text;
	}

	private _initTextPlayer(text: PIXI.Text) {
		text.style.fill = defaultColor;
		text = Tools.resizeText(text, this.root.width, 40);
		text.x = this.root.width / 2 - text.width / 2;
		text.y = ((this.root.height - text.height / 2) * 40) / 100;
		text.visible = true;
		return text;
	}
}
