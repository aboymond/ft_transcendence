import { defaultColor} from '..';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import * as PIXI from 'pixi.js';
import { PixiManager } from '../PixiManager';
import { ErrorResponse } from 'react-router-dom';
import { apiService } from '../../src/services/apiService';
import {AudioManager} from '../AudioManager';

const keyExplanation = PIXI.Texture.from('./img/keyExplanation.png');

const tipsTab = [
	new PIXI.Text('TIP: If you want to move,\n\t\t\t\t\t\t\t\t\t\t\ttry pressing the keys!'),
	new PIXI.Text("TIP: The ball bounces, unless it doesn't.\n\t\t\t\t\t\t\t\t\t\t\tCaptivating, isn't it?"),
	new PIXI.Text(
		'TIP: Press the right key if you want it to go right.\n\t\t\t\t\t\t\t\t\t\t\tRevolutionary, I know.',
	),
	new PIXI.Text('TIP: If you lose, always blame gravity.\n\t\t\t\t\t\t\t\t\t\t\tIt has an issue with balls.'),
	new PIXI.Text(
		'TIP: To win,\n\t\t\t\t\t\t\t\t\t\tmake sure the ball returns more often\n\t\t\t\t\t\t\t\t\t\t\t to your opponent.\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tGenius.',
	),
	new PIXI.Text(
		"TIP: If the ball disappears,\n\t\t\t\t\t\t\tit's probably gone for a coffee.\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tIt will be back later.",
	),
	new PIXI.Text("TIP: Keyboard keys aren't just for decoration.\n\t\t\t\t\t\t\t\t\t\t\tPress them!"),
	new PIXI.Text('TIP: To avoid losing, uninstall the game.\n\t\t\t\t\t\t\t\t\t\t\tVictory is assured.'),
	new PIXI.Text("TIP: If the ball falls, it's probably tired.\n\t\t\t\t\t\t\t\t\t\t\tRespect its naps."),
	new PIXI.Text('TIP: The ball loves rebounds.\n\t\t\t\t\t\t\t\t\t\t\tBe kind, give it some.'),
	new PIXI.Text(
		"TIP: If the game seems easy,\n\t\t\t\t\t\t\t\t\t\t\tyou're probably doing something wrong.\n\t\t\t\t\t\t\t\t\t\t\tOr not.",
	),
	new PIXI.Text("TIP: Keys are like friends,\n\t\t\t\t\t\t\t\t\t\t\tuse them well, and you'll go far."),
	new PIXI.Text("TIP: If you can't win,\n\t\t\t\t\t\t\t\t\t\t\tat least pretend to try."),
	new PIXI.Text("TIP: Balls aren't birds.\n\t\t\t\t\t\t\t\t\t\t\tThey don't like to fly."),
	new PIXI.Text('TIP: Keyboard keys are not enemies.\n\t\t\t\t\t\t\t\t\t\t\tTame them.'),
	new PIXI.Text('TIP: The ball is bouncier when you believe in it.\n\t\t\t\t\t\t\t\t\t\t\tMagic.'),
	new PIXI.Text('TIP: If the ball is too fast,\n\t\t\t\t\t\t\t\t\t\t\tmaybe you should slow down.'),
	new PIXI.Text("TIP: Don't ask the ball why it bounces.\n\t\t\t\t\t\t\t\t\t\t\tIt doesn't know."),
	new PIXI.Text("TIP: If you're confused, press all the keys at once.\n\t\t\t\t\t\t\t\t\t\t\tIt will help."),
	new PIXI.Text(
		"TIP: If you lose, it's probably because of the weather.\n\t\t\t\t\t\t\t\t\t\t\tAlways blame the weather.",
	),
	new PIXI.Text(
		'TIP: The ball is like life, it bounces,\n\t\t\t\t\t\t\t\t\t\t\tand sometimes it surprises you.',
	),
	new PIXI.Text(
		'TIP: Keys are not decorative.\n\t\t\t\t\t\t\t\t\t\t\tUse them as if your victory depends on it.',
	),
	new PIXI.Text('TIP: If the ball is too predictable,\n\t\t\t\t\t\t\t\t\t\t\tit needs a vacation.'),
	new PIXI.Text(
		"TIP: If you lose,\n\t\t\t\t\t\t\t\t\t\t\tit's because you're playing against a formidable opponent...\n\t\t\t\t\t\t\t\t\t\t\tor not.",
	),
	new PIXI.Text('TIP: The ball has no GPS. Guide it with your keys.'),
	new PIXI.Text('TIP: Keys are like magical wands.\n\t\t\t\t\t\t\t\t\t\t\tUse them wisely.'),
	new PIXI.Text(
		"TIP: If the ball goes too high,\n\t\t\t\t\t\t\t\t\t\t\tit's dreaming of becoming a balloon.",
	),
	new PIXI.Text(
		"TIP: The ball has no political opinions.\n\t\t\t\t\t\t\t\t\t\t\tDon't force it to choose a side.",
	),
	new PIXI.Text(
		"TIP: If you win, you're a genius.\n\t\t\t\t\t\t\t\t\t\t\tIf you lose, the ball is cheating.",
	),
	new PIXI.Text('TIP: Keyboard keys have superpowers.\n\t\t\t\t\t\t\t\t\t\t\tDiscover them all.'),
];

export class SceneLoadingPage extends SceneBase {
	private _sprite = new PIXI.Sprite(keyExplanation);
	private _tabTips = tipsTab;

	private _textLoading = new PIXI.Text('LOADING');
	private _textPress = new PIXI.Text('MORE TIPS');
	private _textEnter = new PIXI.Text('[ENTER]');
	private _textPoints: PIXI.Text[] = [];
	private _interval = 0;
	private _index = 0;

	constructor(
		root: PixiManager,
		private _gameId: number,
	) {
		super(root);
	}

	//=======================================
	// HOOK
	//=======================================

	public async onStart(container: PIXI.Container) {
		AudioManager.play('loading');

		this._initKeyExplanation(this._sprite);
		container.addChild(this._sprite);
		// this._containerTips = this._initTipsTab();
		container.addChild(this._initTipsTab());
		container.addChild(this._initMoreTips());
		this._tabTips[this._randomizer()].visible = true;
		// container.addChild(this._tabTips);
		this._initTextLoading(this._textLoading);
		container.addChild(this._textLoading);
		this._textPoints = Array.from({ length: 3 }, () => new PIXI.Text('.'));
		this._initTextPoints(this._textPoints);

		this._textPoints.forEach((text) => container.addChild(text));
		this._textPoints.forEach((text, index) => {
			container.addChild(text);
			text.x = ((this.root.width - text.width) * 88) / 100 + index * 10; // Ajuster la position X
		});

		this._interval = window.setInterval(() => {
			if (this._textEnter) {
				this._textEnter.visible = !this._textEnter.visible;
			}
			if (this._index > 2) {
				this._index = 0;
			}

			if (this._index === 0) {
				this._textPoints[this._textPoints.length - 1].visible = true;
			} else if (this._index === this._textPoints.length - 1) {
				this._textPoints[this._index - 1].visible = true;
			} else {
				this._textPoints[this._index - 1].visible = true;
			}
			// console.log(this._index);
			this._textPoints[this._index].visible = false;
			this._index++;
		}, 800);

		this.notifyPlayerReady();
	}

	public onUpdate() {}

	public onFinish() {
		clearInterval(this._interval);
		AudioManager.pause('loading');
		AudioManager.reset();
		console.log("ICI ON FINISH");
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Enter') {
			for (let i = 0; i < this._tabTips.length - 1; i++) {
				this._tabTips[i].visible = false;
			}
			const randomTips = this._randomizer();
			this._tabTips[randomTips].visible = true;
		}

		if (e.code === 'Escape') {
			apiService
				.leaveLoading(this._gameId)
				.then(() => console.log('Left loading scene'))
				.catch((error: ErrorResponse) => console.error('Error leaving loading', error));
			if (this.root.gameSocket) {
				this.root.gameSocket.close();
				this.root.gameSocket = null;
			}
			this.root.loadScene(new SceneMenu(this.root));
		}
	}

	public onKeyUp() {}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initKeyExplanation(texture: PIXI.Sprite) {
		const pourcentage = 60;
		const newWidth = (this.root.width * pourcentage) / 100;
		const ratio = this._sprite.width / this._sprite.height;
		const newHigth = newWidth / ratio;
		texture.width = newWidth;
		texture.height = newHigth;
		texture.y = 20;
		texture.x = this.root.width / 2 - texture.width / 2;
		texture.visible = true;
	}

	private _initTipsTab() {
		const tips = new PIXI.Container();
		for (let i = 0; i < this._tabTips.length - 1; i++) {
			const tipsBox = new PIXI.Graphics();
			this._tabTips[i].x = 25;
			this._tabTips[i].style.fontSize = this.root.width / 26;
			this._tabTips[i].style.fill = defaultColor;
			this._tabTips[i].visible = false;

			tipsBox.y = this.root.height / 2;
			tipsBox.width = this.root.width;
			tipsBox.endFill();
			tipsBox.addChild(this._tabTips[i]);
			tips.addChild(tipsBox);
		}
		return tips;
	}

	private _initMoreTips() {
		const moreTips = new PIXI.Container();

		this._textPress.y = (this.root.height * 65) / 100;
		this._textPress.x = ((this.root.width - this._textPress.width / 2) * 50) / 100;
		this._textPress.style.fill = defaultColor;
		this._textPress.style.fontSize = this.root.width / 28;

		this._textEnter.y = this._textPress.y + 20;
		this._textEnter.x = this._textPress.x + 8;
		this._textEnter.style.fill = defaultColor;
		this._textEnter.style.fontSize = this.root.width / 25;

		moreTips.addChild(this._textPress, this._textEnter);
		return moreTips;
	}

	private _initTextLoading(text: PIXI.Text) {
		text.style.fill = defaultColor;
		text.style.fontSize = ((this.root.width - text.width) * 8) / 100;
		text.y = ((this.root.height - text.height) * 95) / 100;
		text.x = ((this.root.width - text.width) * 80) / 100;
	}

	private _initTextPoints(textArray: PIXI.Text[]) {
		textArray.forEach((text) => {
			text.style.fill = defaultColor;
			text.style.fontSize = ((this.root.width - text.width) * 8) / 100;
			text.y = ((this.root.height - text.height) * 95) / 100;
			text.x = ((this.root.width - text.width) * 87) / 100;
			text.visible = true;
		});
	}

	//=======================================
	// UTILS
	//=======================================

	private _randomizer() {
		return Math.floor(Math.random() * this._tabTips.length);
	}

	private async notifyPlayerReady() {
		try {
			await apiService.sendPlayerReady(this._gameId).then(() => {
				if (!this.root.gameSocket) {
					this.root.openGameSocket(this._gameId);
				}
			});
		} catch (error) {
			console.error('Error notifying player ready:', error);
		}
	}
}
