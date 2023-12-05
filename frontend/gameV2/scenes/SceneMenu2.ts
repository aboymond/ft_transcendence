import * as PIXI from 'pixi.js';
import { SceneBase } from "./SceneBase";
import { SceneMenuOption } from "./SceneMenuOption";
import { SceneMenuTournament } from "./SceneMenuTournament";
import { glowFilter, defaultColor, textStylePVPMenu2, textStylePVBMenu2, textStyleTournamentMenu} from "..";

const selectMax = 2;


export class SceneMenu2 extends SceneBase {

	private _currentSelect = 0;

	private _menuBoxTournament = new PIXI.Graphics();
	private _menuBoxPvP = new PIXI.Graphics(); 
	private _menuBoxPvB = new PIXI.Graphics(); 
	private _textTournament = new PIXI.Text('TOURNAMENT', textStyleTournamentMenu);
	private _textPvP = new PIXI.Text('PLAYER\n  VS\n  PLAYER', textStylePVPMenu2);
	private _textPvB = new PIXI.Text('PLAYER\n  VS\n  BOT', textStylePVBMenu2);


	//=======================================
	// Effects
	//=======================================



	//=======================================
	// HOOK
	//=======================================

	public onStart(container: PIXI.Container) {

		container.addChild(this._menuBoxInit(this._menuBoxTournament));
		container.addChild(this._menuBoxInit(this._menuBoxPvP));
		container.addChild(this._menuBoxInit(this._menuBoxPvB));
		container.addChild(this._initTextTournament(this._textTournament));
		container.addChild(this._initTextPlayerVsPlayer(this._textPvP));
		container.addChild(this._initTextPlayerVsBot(this._textPvB));
		this._textTournament.style.fill = 0x053100;
		this._textPvP.style.fill = defaultColor;
		this._textPvB.style.fill = defaultColor;
	}

	public onUpdate() {

	}

	public onFinish() {
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'ArrowUp') {
			this._pressUp();
			this._updateMenuColor(); 
		}
		if (e.code === 'ArrowDown') {
			this._pressDown();
			this._updateMenuColor(); 
		}
		if (e.code === 'Enter') {
			if (this._currentSelect === 0) {
				this.root.loadScene(new SceneMenuTournament(this.root));
			}
			else
				this.root.loadScene(new SceneMenuOption(this.root));
		}

	}

	public onKeyUp() {

	}

	//=======================================
	// UTILS 
	//=======================================
	
	private _initTextTournament (text: PIXI.Text) {
		text.x = (this.root.width / 2) - text.width / 2;
		text.y = ((this.root.height / 3) / 2) - text.height / 2;
		text.filters = [glowFilter];
		return text;
	}

	private _initTextPlayerVsPlayer (text: PIXI.Text) {
		text.x = (this.root.width / 2) - text.width / 2;
		text.y = this.root.height / 2 - text.height / 2;
		text.filters = [glowFilter];
		return text;
	}

	private _initTextPlayerVsBot (text: PIXI.Text) {
		text.x = (this.root.width / 2) - text.width / 2;
		text.y = ((this.root.height / 3) + (this.root.height / 2)) - text.height / 2;
		text.filters = [glowFilter];
		return text;
	}

	private _menuBoxInit (menuBox: PIXI.Graphics) {

		menuBox.clear();
		menuBox.beginFill(defaultColor);
		menuBox.drawRect(0, 0, this.root.width, this.root.height / 3);
		menuBox.endFill();
		// menuBox.filters = [glowFilter];
		
		return menuBox;
	}


	//=======================================
	// UTILS 
	//=======================================

	private _pressUp () {
		this._currentSelect --;
		if (this._currentSelect < 0 )
			this._currentSelect = selectMax;
		this._updateMenuColor();
	}

	private _pressDown () {
		this._currentSelect ++;
		if (this._currentSelect > selectMax )
		this._currentSelect = 0;
		this._updateMenuColor();
	}

	private _updateMenuColor () {

		if (this._currentSelect === 0) {
			this._menuBoxTournament.clear();
			this._menuBoxPvP.clear();
			this._menuBoxPvB.clear();
			this._menuBoxTournament.beginFill(defaultColor);
			this._menuBoxTournament.drawRect(0, 0, this.root.width, this.root.height / 3);
			this._menuBoxTournament.endFill();

			this._textTournament.style.fill = 0x053100;
			this._textPvB.style.fill = defaultColor;
			this._textPvP.style.fill = defaultColor;

		}

		if (this._currentSelect === 1) {
			this._menuBoxTournament.clear();
			this._menuBoxPvP.clear();
			this._menuBoxPvB.clear();

			this._menuBoxPvP.beginFill(defaultColor);
			this._menuBoxPvP.drawRect(0, 0, this.root.width, this.root.height / 3);
			this._menuBoxPvP.endFill();
			this._menuBoxPvP.y = this.root.height / 2 - this._menuBoxPvP.height / 2;

			this._textTournament.style.fill = defaultColor;
			this._textPvP.style.fill = 0x053100;
			this._textPvB.style.fill = defaultColor;
			this.root.vsPlayer = true;
		}

		if (this._currentSelect === 2) {
			this._menuBoxTournament.clear();
			this._menuBoxPvP.clear();
			this._menuBoxPvB.clear();

			this._menuBoxPvB.beginFill(defaultColor);
			this._menuBoxPvB.drawRect(0, 0, this.root.width, this.root.height / 3);
			this._menuBoxPvB.endFill();
			this._menuBoxPvB.y = this.root.height - this._menuBoxPvB.height;

			this._textTournament.style.fill = defaultColor;
			this._textPvP.style.fill = defaultColor;
			this._textPvB.style.fill = 0x053100;
			this.root.vsPlayer = false;
		}
	
	}
}