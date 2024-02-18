import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { defaultColor, textStyleTitleMenu1 } from '../index';
import { AudioManager } from '../AudioManager';
import { PixiManager } from '../PixiManager';

export class SceneTournamentWinner extends SceneBase {
	private _textTitle = new PIXI.Text('WINS', textStyleTitleMenu1);
	private _nameText = new PIXI.Text('');
	private _crownSprite = PIXI.Texture.from('./img/crown.png');
	private _interval = 0;

	constructor(
		public root: PixiManager,
		private _gameId: number,
		private _playerName: string,
	) {
		super(root);
	}

	public async onStart(container: PIXI.Container) {
		AudioManager.play('win');
		this._nameText.text = this._playerName;
		console.log('ID: ' + this._gameId + ' Player: ' + this._nameText.text);
		container.addChild(this._initTextTitle());
		container.addChild(this._initTextName());
		container.addChild(this._initCrown());

		this._interval = window.setInterval(() => {
			if (this._nameText) {
				this._nameText.visible = !this._nameText.visible;
			}
			if (this._textTitle) {
				this._textTitle.visible = !this._textTitle.visible;
			}
		}, 1000);
	}

	public onUpdate() {}

	public onFinish() {
		clearInterval(this._interval);
		AudioManager.reset();
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Enter') {
			this.root.loadScene(new SceneMenu(this.root));
		}
	}

	public onKeyUp() {}

	private _initTextTitle() {
		const pourcentage = 95;
		const newWidth = (this.root.width * pourcentage) / 100;
		const ratio = this._textTitle.width / this._textTitle.height;
		const newHigth = newWidth / ratio;

		this._textTitle.height = newHigth;
		this._textTitle.width = newWidth;
		this._textTitle.x = this.root.width / 2 - this._textTitle.width / 2;
		this._textTitle.y = (this.root.height * 50) / 100 - this._textTitle.height / 2;
		return this._textTitle;
	}

	private _initTextName() {
		this._nameText.style.fill = defaultColor;
		this._nameText.style.fontSize = (this.root.width * 10) / 100;
		this._nameText.x = (this.root.width * 50) / 100 - this._nameText.width / 2;
		this._nameText.y = (this.root.height * 35) / 100 - this._nameText.height / 2;
		return this._nameText;
	}

	private _initCrown() {
		const crown = new PIXI.Sprite(this._crownSprite);
		const pourcentage = 100;
		const newWidth = (this.root.width * pourcentage) / 100;
		const ratio = crown.width / crown.height;
		const newHigth = newWidth / ratio;

		crown.width = newWidth;
		crown.height = newHigth;
		crown.anchor.set(0.5, 0.5);
		crown.x = (this.root.width * 50) / 100;
		crown.y = (this.root.height * 50) / 100;
		crown.angle = 90;
		return crown;
	}
}
