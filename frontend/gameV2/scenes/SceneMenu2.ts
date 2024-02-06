import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { SceneMenuOption } from './SceneMenuOption';
import { SceneMenuTournament } from './SceneMenuTournament';
import { SceneJoin } from './SceneJoin';
// import { glowFilter, defaultColor, textStylePVPMenu2, textStylePVBMenu2, textStyleTournamentMenu, textStyleJoinMenu2 } from '..';

const selectMax = 2;
const selectMax_LR = 1;

enum allSprite {
	TOURNAMENT_S = 0,
	TOURNAMENT_U = 1,
	PVP_S = 2,
	PVP_U = 3,
	PVB_S = 4,
	PVB_U = 5,
	JOIN_S = 6,
	JOIN_U = 7,
}

enum menu {
	TOURNAMENT = 0,
	PVP_PVB = 1,
	JOIN = 2,
}

const textures = [
	PIXI.Texture.from('./img/TournamentSelected.png'),
	PIXI.Texture.from('./img/TournamentUnselect.png'),
	PIXI.Texture.from('./img/PvPSelected.png'),
	PIXI.Texture.from('./img/PvPUnselect.png'),
	PIXI.Texture.from('./img/PlayerVsBotSelected.png'),
	PIXI.Texture.from('./img/PlayerVsBotUnselect.png'),
	PIXI.Texture.from('./img/JoinPartySelected.png'),
	PIXI.Texture.from('./img/JoinPartyUnselect.png'),
];

export class SceneMenu2 extends SceneBase {
	private _currentSelect = menu.TOURNAMENT;
	private _currentSelect_LR = 0;
	private _sprites: PIXI.Sprite[] = [];

	public async onStart(container: PIXI.Container) {
		for (let i = 0; i < textures.length; i++) {
			this._sprites.push(new PIXI.Sprite(textures[i]));
		}
		for (let i = 0; i < this._sprites.length; i++) {
			container.addChild(this._menuBoxInitSprite(this._sprites[i]));
		}

		this._initSpritePvP(this._sprites[allSprite.PVP_S]);
		this._initSpritePvP(this._sprites[allSprite.PVP_U]);
		this._initSpriteJoin(this._sprites[allSprite.JOIN_S]);
		this._initSpriteJoin(this._sprites[allSprite.JOIN_U]);
		this._initSpritePvB(this._sprites[allSprite.PVB_S]);
		this._initSpritePvB(this._sprites[allSprite.PVB_U]);

		this._sprites[allSprite.TOURNAMENT_U].visible = false;
		this._sprites[allSprite.PVP_S].visible = false;
		this._sprites[allSprite.PVP_U].visible = true;
		this._sprites[allSprite.JOIN_S].visible = false;
		this._sprites[allSprite.JOIN_U].visible = true;
		this._sprites[allSprite.PVB_S].visible = false;
		this._sprites[allSprite.PVB_U].visible = true;
	}

	public onUpdate() {}

	public onFinish() {}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'ArrowUp') {
			this._pressUp();
			this._updateMenuColor();
		}
		if (e.code === 'ArrowDown') {
			this._pressDown();
			this._updateMenuColor();
		}
		if (e.code === 'ArrowRight') {
			if (this._currentSelect === menu.PVP_PVB) {
				this._pressRight();
				this._updateMenuColor();
			}
		}
		if (e.code === 'ArrowLeft') {
			if (this._currentSelect === menu.PVP_PVB) {
				this._pressLeft();
				this._updateMenuColor();
			}
		}
		if (e.code === 'Enter') {
			if (this._currentSelect === menu.TOURNAMENT) {
				this.root.loadScene(new SceneMenuTournament(this.root));
			} else if (this._currentSelect === menu.PVP_PVB) {
				if (this._currentSelect_LR === 0) {
					this.root.vsPlayer = true;
					this.root.loadScene(new SceneMenuOption(this.root));
				} else {
					this.root.vsPlayer = false;
					this.root.loadScene(new SceneMenuOption(this.root));
				}
			} else if (this._currentSelect === menu.JOIN) {
				this.root.loadScene(new SceneJoin(this.root));
			}
		}

		if (e.code === 'Escape') {
			this.root.loadScene(new SceneMenu(this.root));
		}
	}

	public onKeyUp() {}

	//=======================================
	// UTILS
	//=======================================

	private _initSpritePvP(sprite: PIXI.Sprite) {
		sprite.width = this.root.width / 2;

		sprite.y = this.root.height / 2 - this._sprites[allSprite.PVP_U].height / 2;
	}
	private _initSpriteJoin(sprite: PIXI.Sprite) {
		sprite.y = this.root.height / 3 + this.root.height / 2 - sprite.height / 2;
	}
	private _initSpritePvB(sprite: PIXI.Sprite) {
		sprite.width = this.root.width / 2;
		sprite.x = this.root.width / 2;
		sprite.y = this.root.height / 2 - this._sprites[allSprite.PVB_U].height / 2;
	}

	private _menuBoxInitSprite(menuBox: PIXI.Sprite) {
		menuBox.width = this.root.width;
		menuBox.height = this.root.height / 3;

		return menuBox;
	}

	//=======================================
	// UTILS
	//=======================================

	private _pressUp() {
		this._currentSelect--;
		if (this._currentSelect < 0) this._currentSelect = selectMax;
		this._updateMenuColor();
	}

	private _pressDown() {
		this._currentSelect++;
		if (this._currentSelect > selectMax) this._currentSelect = 0;
		this._updateMenuColor();
	}

	private _pressRight() {
		this._currentSelect_LR++;
		if (this._currentSelect_LR > selectMax_LR) this._currentSelect_LR = 0;
		this._updateMenuColor();
	}

	private _pressLeft() {
		this._currentSelect_LR--;
		if (this._currentSelect_LR < 0) this._currentSelect_LR = selectMax_LR;
		this._updateMenuColor;
	}

	private _updateMenuColor() {
		if (this._currentSelect === menu.TOURNAMENT) {
			this._sprites[allSprite.TOURNAMENT_S].visible = true;
			this._sprites[allSprite.PVP_S].visible = false;
			this._sprites[allSprite.JOIN_S].visible = false;
			this._sprites[allSprite.PVB_S].visible = false;

			this._sprites[allSprite.TOURNAMENT_U].visible = false;
			this._sprites[allSprite.PVP_U].visible = true;
			this._sprites[allSprite.JOIN_U].visible = true;
			this._sprites[allSprite.PVB_U].visible = true;
		}

		if (this._currentSelect === menu.PVP_PVB) {
			this._sprites[allSprite.TOURNAMENT_S].visible = false;
			this._sprites[allSprite.PVP_S].visible = true;
			this._sprites[allSprite.JOIN_S].visible = false;
			this._sprites[allSprite.PVB_S].visible = false;

			this._sprites[allSprite.TOURNAMENT_U].visible = true;
			this._sprites[allSprite.PVP_U].visible = false;
			this._sprites[allSprite.JOIN_U].visible = true;
			this._sprites[allSprite.PVB_U].visible = true;

			if (this._currentSelect_LR === 0) {
				this._sprites[allSprite.TOURNAMENT_S].visible = false;
				this._sprites[allSprite.PVP_S].visible = true;
				this._sprites[allSprite.JOIN_S].visible = false;
				this._sprites[allSprite.PVB_S].visible = false;

				this._sprites[allSprite.TOURNAMENT_U].visible = true;
				this._sprites[allSprite.PVP_U].visible = false;
				this._sprites[allSprite.JOIN_U].visible = true;
				this._sprites[allSprite.PVB_U].visible = true;
			}
			if (this._currentSelect_LR === 1) {
				this._sprites[allSprite.TOURNAMENT_S].visible = false;
				this._sprites[allSprite.JOIN_S].visible = false;
				this._sprites[allSprite.PVP_S].visible = false;
				this._sprites[allSprite.PVB_S].visible = true;

				this._sprites[allSprite.TOURNAMENT_U].visible = true;
				this._sprites[allSprite.JOIN_U].visible = true;
				this._sprites[allSprite.PVP_U].visible = true;
				this._sprites[allSprite.PVB_U].visible = false;

				this.root.vsPlayer = true;
			}
		}

		if (this._currentSelect === menu.JOIN) {
			this._sprites[allSprite.TOURNAMENT_S].visible = false;
			this._sprites[allSprite.PVP_S].visible = false;
			this._sprites[allSprite.JOIN_S].visible = true;
			this._sprites[allSprite.PVB_S].visible = false;

			this._sprites[allSprite.TOURNAMENT_U].visible = true;
			this._sprites[allSprite.PVP_U].visible = true;
			this._sprites[allSprite.JOIN_U].visible = false;
			this._sprites[allSprite.PVB_U].visible = true;
		}
	}
}
