import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import {
	defaultColor,
	textStyleMenuOptionColor,
	textStyleMenuOptionPad,
	textStyleMenuOptionLevel,
	textStyleMenuOptionPlay,
	textStyleMenuOptionError,
	textStyleMenuOptionVictory,
} from '../index';
import { SceneGameVsBot } from './SceneGameVsBot';
import { SceneLoadingPage } from './SceneLoadingPage';
import { SceneGamePvpLocal } from './SceneGamePvpLocal';
import { apiService } from '../../src/services/apiService';
import { AudioManager } from '../AudioManager';
import { Tools } from '../Tools';

const selectMax = 4;
let errorLock: boolean = false;

let ifLocal: boolean = true;

enum menu {
	COLOR = 0,
	BOT_LVL = 1,
	VICTORY_AMOUNT = 2,
	PAD = 3,
	PLAY = 4,
}

const chooseColor: string[] = [
	'GREEN',
	'IMPERIAL GREEN',
	'SUPER GREEN',
	'HYPER LIGHT GREEN',
	'PERFECT GEEN',
	'ECO FRIENDLY',
	'JEROME GREEN',
	'JUST GREEN',
	'GREEN LANTERN',
	'BLUE + YELLOW',
	'0X1AFF00',
	'GREEN NEON',
];
const chooseVictoryAmount: number[] = [1, 3, 5, 10];
const chooseBotLevel: string[] = ['EASY', 'MEDIUM', 'HARD', 'IMPOSSIBLE!!!'];
const botLvlNum: number[] = [0.05, 0.075, 0.09, 0.9];
const choosePad: string[] = ['BASIC', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED', 'LOCKED'];
const choosePvpOption: string[] = ['LOCAL', 'ONLINE'];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const textures = [
	PIXI.Texture.from('./img/pad0.png'),
	PIXI.Texture.from('./img/pad1.png'),
	PIXI.Texture.from('./img/pad2.png'),
	PIXI.Texture.from('./img/pad3.png'),
	PIXI.Texture.from('./img/pad4.png'),
	PIXI.Texture.from('./img/pad5.png'),
];

export class SceneMenuOption extends SceneBase {
	private _currentSelect = 0;

	private _currentColor = 0;
	private _currentPad = 0;
	private _currentBotLevel = 0;
	private _currentPvpOption = 0;
	private _currentVictory = 0;

	private _padColor = new PIXI.Graphics();
	private _popError = new PIXI.Graphics();

	private _spritesPad: PIXI.Sprite[] = [];

	//=======================================
	// Effects
	//=======================================

	//=======================================
	// HOOK
	//=======================================

	private _textColorAvatar = new PIXI.Text('< CHOOSE COLOR [GREEN] >', textStyleMenuOptionColor);
	private _textPad = new PIXI.Text('< CHOOSE PAD [BASIC]>', textStyleMenuOptionPad);
	private _textBotLevel = new PIXI.Text('< CHOOSE BOT LEVEL [EASY] >', textStyleMenuOptionLevel);
	private _textPvpOption = new PIXI.Text('< PVP OPTION [LOCAL] >', textStyleMenuOptionLevel);
	private _textVictoryAmount = new PIXI.Text('< CHOOSE VICTORY AMOUNT [1] >', textStyleMenuOptionVictory);
	private _textPlay = new PIXI.Text('PLAY', textStyleMenuOptionPlay);
	private _textErrorPad = new PIXI.Text('SELECT AN AVALIBLE PAD', textStyleMenuOptionError);
	private _textErrorOK = new PIXI.Text('[ ENTER ]', textStyleMenuOptionError);

	public async onStart(container: PIXI.Container) {
		// Init text
		container.addChild(this._createTextColorAvatar(this._textColorAvatar));
		container.addChild(this._createTextPad(this._textPad));
		container.addChild(this._createTextPlay(this._textPlay));
		container.addChild(this._createTextVictory(this._textVictoryAmount));

		container.addChild(this._createPadColor(this._padColor));
		this._padColor.y = this._textColorAvatar.y - 20;
		this._padColor.x = this.root.width / 2 + this._padColor.width / 2;

		if (!this.root.vsPlayer) {
			container.addChild(this._createTextBotLevel(this._textBotLevel));
		} else {
			container.addChild(this._createTextPvpOption(this._textPvpOption));
			// this._textVictoryAmount.y = this.root.height / 2 - this._textVictoryAmount.height / 2;
		}

		for (let i = 0; i < textures.length; i++) {
			this._spritesPad.push(new PIXI.Sprite(textures[i]));
		}

		for (let i = 0; i < this._spritesPad.length; i++) {
			container.addChild(this._spritesPad[i]);
			this._spritesPad[i] = Tools.resizeSprite(this._spritesPad[i], this.root.width, 35);
			this._spritesPad[i].x = this.root.width / 2 - this._spritesPad[i].width / 2;
			this._spritesPad[i].y = (this.root.height * 70) / 100 - this._spritesPad[i].height / 2;
			this._spritesPad[i].tint = 'green';
			this._spritesPad[i].visible = false;
		}
		this._spritesPad[0].visible = true;

		container.addChild(this._createPopError(this._popError));
		container.addChild(this._createTextError(this._textErrorPad));
		this._textErrorPad.y = this._popError.y - (this._popError.height * 70) / 100;
		container.addChild(this._createTextError(this._textErrorOK));
		this._textErrorOK.y = this._popError.y - (this._popError.height * 40) / 100;
	}

	public onUpdate() {
		this._updateMenuColor();
	}

	public onFinish() {
		AudioManager.reset();
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'ArrowUp') {
			AudioManager.play('select');
			if (!errorLock) this._pressUp();
		}
		if (e.code === 'ArrowDown') {
			AudioManager.play('select');
			if (!errorLock) this._pressDown();
		}
		if (e.code === 'ArrowLeft') {
			AudioManager.play('select');
			if (!errorLock) this._pressLeft();
		}
		if (e.code === 'ArrowRight') {
			AudioManager.play('select');
			if (!errorLock) this._pressRight();
		}
		if (e.code === 'Enter') {
			if (errorLock) {
				errorLock = false;
				this._popError.visible = false;
				this._textErrorOK.visible = false;
				this._textErrorPad.visible = false;
			} else this._createGame();
		}
		if (e.code === 'Escape') {
			this.root.loadScene(new SceneMenu2(this.root));
		}
	}

	public onKeyUp() {}

	//=======================================
	// UTILS
	//=======================================

	private _createTextColorAvatar(text: PIXI.Text) {
		text = Tools.resizeText(text, this.root.width, 30);
		text.y = (25 * this.root.height) / 100;
		text.x = this.root.width / 2 - text.width / 2;
		return text;
	}

	private _createTextPad(text: PIXI.Text) {
		text = Tools.resizeText(text, this.root.width, 30);
		text.y = (75 * this.root.height) / 100;
		text.x = this.root.width / 2 - text.width / 2;

		return text;
	}

	private _createTextBotLevel(text: PIXI.Text) {
		text = Tools.resizeText(text, this.root.width, 30);
		text.x = this.root.width / 2 - text.width / 2;
		text.y = this.root.height / 2 - text.height / 2 - 25;
		return text;
	}

	private _createTextPvpOption(text: PIXI.Text) {
		text = Tools.resizeText(text, this.root.width, 30);
		text.x = this.root.width / 2 - text.width / 2;
		text.y = this.root.height / 2 - text.height / 2 - 25;
		return text;
	}

	private _createTextVictory(text: PIXI.Text) {
		text = Tools.resizeText(text, this.root.width, 30);
		text.x = this.root.width / 2 - text.width / 2;
		text.y = this.root.height / 2 - text.height / 2 + 25;
		return text;
	}

	private _createTextPlay(text: PIXI.Text) {
		text = Tools.resizeText(text, this.root.width, 45);
		text.x = this.root.width / 2 - text.width / 2;
		text.y = this.root.height - text.height / 2 - 30;
		return text;
	}

	private _createPadColor(pad: PIXI.Graphics) {
		pad.beginFill(defaultColor);
		pad.drawRect(-50, -50, 50, 50);
		pad = Tools.resizeGraphics(pad, this.root.width, 15);
		pad.endFill();
		return pad;
	}

	private _createPopError(pop: PIXI.Graphics) {
		pop.beginFill('green');
		pop.drawRect(-280, -150, 280, 150);
		pop = Tools.resizeGraphics(pop, this.root.width, 70);
		pop.x = this.root.width / 2 + pop.width / 2;
		pop.y = (this.root.height * 80) / 100;
		pop.endFill();
		pop.visible = false;
		return pop;
	}

	private _createTextError(error: PIXI.Text) {
		error = Tools.resizeText(error, this.root.width, 25);
		// error.y = this._popError.y - this._popError.height / 2;
		error.x = this.root.width / 2 - error.width / 2;
		error.visible = false;
		return error;
	}

	//=======================================
	// UTILS NAVIGATOR
	//=======================================

	private _createGame() {
		if (this._currentSelect != menu.PLAY) return;
		if (this.root.vsPlayer && this._currentPad === 0) {
			// Send a request to the backend to create a game
			AudioManager.play('enter');
			if (ifLocal) {
				this.root.loadScene(new SceneGamePvpLocal(this.root));
			} else {
				apiService
					.createGame(this.root.userId ?? 0, chooseVictoryAmount[this._currentVictory])
					.then((response) => {
						this.root.loadScene(new SceneLoadingPage(this.root, response.id));
					})
					.catch((error) => console.error('Error creating game', error));
			}
		} else if (this._currentPad === 0) {
			AudioManager.play('enter');
			this.root.loadScene(new SceneGameVsBot(this.root));
		} else {
			errorLock = true;
			this._popError.visible = true;
			this._textErrorOK.visible = true;
			this._textErrorPad.visible = true;
		}
	}

	private _pressUp() {
		this._currentSelect--;
		// if (this._currentSelect === menu.BOT_LVL) this._currentSelect--;
		if (this._currentSelect < 0) this._currentSelect = selectMax;
	}

	private _pressDown() {
		this._currentSelect++;
		// if (this._currentSelect === menu.BOT_LVL) this._currentSelect++;
		if (this._currentSelect > selectMax) this._currentSelect = 0;
	}

	private _pressLeft() {
		if (this._currentSelect === menu.COLOR) return this._colorPrev();
		if (!this.root.vsPlayer) {
			if (this._currentSelect === menu.BOT_LVL) return this._botLvlPrev();
		} else {
			if (this._currentSelect === menu.BOT_LVL) return this._pvpOptionPrev();
		}
		if (this._currentSelect === menu.VICTORY_AMOUNT) return this._VictoryAmountPrev();
		if (this._currentSelect === menu.PAD) return this._padPrev();
	}

	private _pressRight() {
		if (this._currentSelect === menu.COLOR) return this._colorNext();
		if (!this.root.vsPlayer) {
			if (this._currentSelect === menu.BOT_LVL) return this._botLvlNext();
		} else {
			if (this._currentSelect === menu.BOT_LVL) return this._pvpOptionNext();
		}
		if (this._currentSelect === menu.VICTORY_AMOUNT) return this._VictoryAmountNext();
		if (this._currentSelect === menu.PAD) return this._padNext();
	}

	private _colorPrev() {
		this._currentColor--;
		if (this._currentColor < 0) this._currentColor = chooseColor.length - 1;
		this._textColorAvatar.text = '< ' + chooseColor[this._currentColor] + ' >';
		this._textColorAvatar.x = this.root.width / 2 - this._textColorAvatar.width / 2;
		this._updateColor();
	}

	private _colorNext() {
		this._currentColor++;
		if (this._currentColor > chooseColor.length - 1) this._currentColor = 0;
		this._textColorAvatar.text = '< ' + chooseColor[this._currentColor] + ' >';
		this._textColorAvatar.x = this.root.width / 2 - this._textColorAvatar.width / 2;
		this._updateColor();
	}

	private _padPrev() {
		this._spritesPad[this._currentPad].visible = false;
		this._currentPad--;
		if (this._currentPad < 0) this._currentPad = choosePad.length - 1;
		this._spritesPad[this._currentPad].visible = true;
		this._textPad.text = '< ' + choosePad[this._currentPad] + ' >';
		this._textPad.x = this.root.width / 2 - this._textPad.width / 2;
	}

	private _padNext() {
		this._spritesPad[this._currentPad].visible = false;
		this._currentPad++;
		if (this._currentPad > choosePad.length - 1) this._currentPad = 0;
		this._spritesPad[this._currentPad].visible = true;
		this._textPad.text = '< ' + choosePad[this._currentPad] + ' >';
		this._textPad.x = this.root.width / 2 - this._textPad.width / 2;
	}

	private _botLvlPrev() {
		this._currentBotLevel--;
		if (this._currentBotLevel < 0) this._currentBotLevel = chooseBotLevel.length - 1;
		this._textBotLevel.text = '< ' + chooseBotLevel[this._currentBotLevel] + ' >';
		this._textBotLevel.x = this.root.width / 2 - this._textBotLevel.width / 2;
		this.root.botLvl = botLvlNum[this._currentBotLevel];
	}

	private _botLvlNext() {
		this._currentBotLevel++;
		if (this._currentBotLevel > chooseBotLevel.length - 1) this._currentBotLevel = 0;
		this._textBotLevel.text = '< ' + chooseBotLevel[this._currentBotLevel] + ' >';
		this._textBotLevel.x = this.root.width / 2 - this._textBotLevel.width / 2;
		this.root.botLvl = botLvlNum[this._currentBotLevel];
	}

	private _pvpOptionPrev() {
		this._currentPvpOption--;
		if (this._currentPvpOption < 0) this._currentPvpOption = choosePvpOption.length - 1;
		this._textPvpOption.text = '< ' + choosePvpOption[this._currentPvpOption] + ' >';
		this._textPvpOption.x = this.root.width / 2 - this._textPvpOption.width / 2;
		if (this._currentPvpOption === 0) {
			ifLocal = true;
		} else ifLocal = false;
	}

	private _pvpOptionNext() {
		this._currentPvpOption++;
		if (this._currentPvpOption > choosePvpOption.length - 1) this._currentPvpOption = 0;
		this._textPvpOption.text = '< ' + choosePvpOption[this._currentPvpOption] + ' >';
		this._textPvpOption.x = this.root.width / 2 - this._textPvpOption.width / 2;
		if (this._currentPvpOption === 0) {
			ifLocal = true;
		} else ifLocal = false;
	}

	private _VictoryAmountPrev() {
		this._currentVictory--;
		if (this._currentVictory < 0) this._currentVictory = chooseVictoryAmount.length - 1;
		this._textVictoryAmount.text = '< ' + chooseVictoryAmount[this._currentVictory] + ' >';
		this._textVictoryAmount.x = this.root.width / 2 - this._textVictoryAmount.width / 2;
		this.root.amountVictory = chooseVictoryAmount[this._currentVictory];
	}

	private _VictoryAmountNext() {
		this._currentVictory++;
		if (this._currentVictory > chooseVictoryAmount.length - 1) this._currentVictory = 0;
		this._textVictoryAmount.text = '< ' + chooseVictoryAmount[this._currentVictory] + ' >';
		this._textVictoryAmount.x = this.root.width / 2 - this._textVictoryAmount.width / 2;
		this.root.amountVictory = chooseVictoryAmount[this._currentVictory];
	}

	private _updateMenuColor() {
		if (this._currentSelect === 0) {
			this._padColor.tint = defaultColor;
			this._textColorAvatar.style.fill = defaultColor;
			this._textBotLevel.style.fill = 'green';
			this._textVictoryAmount.style.fill = 'green';
			this._spritesPad[this._currentPad].tint = 'green';
			this._textPad.style.fill = 'green';
			this._textPlay.style.fill = 'green';
		} else if (this._currentSelect === 1) {
			this._textColorAvatar.style.fill = 'green';
			this._textBotLevel.style.fill = defaultColor;
			this._textVictoryAmount.style.fill = 'green';
			this._padColor.tint = 'green';
			this._spritesPad[this._currentPad].tint = 'green';
			this._textPad.style.fill = 'green';
			this._textPlay.style.fill = 'green';
		} else if (this._currentSelect === 2) {
			this._padColor.tint = 'green';
			this._textColorAvatar.style.fill = 'green';
			this._textBotLevel.style.fill = 'green';
			this._textVictoryAmount.style.fill = defaultColor;
			this._spritesPad[this._currentPad].tint = 'green';
			this._textPad.style.fill = 'green';
			this._textPlay.style.fill = 'green';
		} else if (this._currentSelect === 3) {
			this._textColorAvatar.style.fill = 'green';
			this._padColor.tint = 'green';
			this._textVictoryAmount.style.fill = 'green';
			this._spritesPad[this._currentPad].tint = defaultColor;
			this._textPad.style.fill = defaultColor;
			this._textPlay.style.fill = 'green';
		} else if (this._currentSelect === 4) {
			this._textColorAvatar.style.fill = 'green';
			this._textVictoryAmount.style.fill = 'green';
			this._padColor.tint = 'green';
			this._spritesPad[this._currentPad].tint = 'green';
			this._textPad.style.fill = 'green';
			this._textPlay.style.fill = defaultColor;
		}
	}

	async _updateColor() {
		this._padColor.clear();
		await sleep(150);
		this._padColor.beginFill(defaultColor);
		this._padColor.drawRect(-50, -50, 50, 50);
		this._padColor.y = this._textColorAvatar.y - 20;
		this._padColor.x = this.root.width / 2 + this._padColor.width / 2;
		this._padColor.endFill();
	}
}
