import { defaultColor, glowFilter } from '..';
import { SceneBase } from './SceneBase';
import * as PIXI from 'pixi.js';
// import { PixiManager } from '../PixiManager';
// import apiService from '../../src/services/apiService';
// import { SceneLoadingPage } from './SceneLoadingPage';
// import { SceneGame } from './SceneGame';


const tournamentLine = PIXI.Texture.from('./img/tournamentLine.png');




export class SceneTournamentLoadingVs extends SceneBase {

	// TITlE
	private _standings = new PIXI.Text("< STANDINGS >");


	//SPRITES
	private _containerSprite = new PIXI.Container;
	private _sprites: PIXI.Sprite[] = [];
	private _sprite = new PIXI.Sprite(tournamentLine);
	
	//NAME VS
	private _nameVs: PIXI.Text[] = [];
	private _containerNames = new PIXI.Container();

	//=======================================
	// HOOK
	//=======================================



	public async onStart(container: PIXI.Container) {

		this._initTextStandings(this._standings);
		container.addChild(this._standings);

		
		
		if (this.root.currentTournament?.max_participants === 4) {
			this._initLineTournament4(this._containerSprite);
			container.addChild(this._containerSprite);
			container.addChild(this._initNameVs4(this._containerNames));
			
		}
		else if (this.root.currentTournament?.max_participants === 8) {
			this._initLineTournament8(this._containerSprite);
			container.addChild(this._containerSprite);
			container.addChild(this._initNameVs8(this._containerNames));
		}
		

	}
	
	public onUpdate() {
		
	}

	public onFinish() {

	}

	public onKeyDown() {

	}

	public onKeyUp() {
	}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initTextStandings (text: PIXI.Text) {

		text.style.fill	= defaultColor;
		text.filters = [glowFilter];
		text.style.fontSize = (this.root.width * 7) / 100;
		text.y = (this.root.height * 5) / 100;
		text.x = ((this.root.width * 50) / 100) - text.width / 2;

		return text;
	}


	private _initLineTournament4 (container: PIXI.Container) {

		const size = (this.root.width / 2) / 2;
		const pourcentage = 30;
		const newWidth = ((this.root.width * pourcentage) / 100);
		const ratio = this._sprite.width / this._sprite.height;
		const newHigth = newWidth / ratio;

		for (let i = 0; i < 2; i++){
			this._sprites[i] = new PIXI.Sprite(tournamentLine);
		}

		this._sprite.width = newWidth;
		this._sprite.height = newHigth;
		this._sprite.x = this.root.width / 2 - this._sprite.width / 2;
		this._sprite.y = (this.root.height * 25) / 100;

		const containerSprite = new PIXI.Container();

		this._sprites[0].width = newWidth;
		this._sprites[0].height = newHigth;
		this._sprites[0].y = this._sprite.y + this._sprite.height;
		this._sprites[0].x = size - this._sprites[0].width / 2;

		this._sprites[1].width = newWidth;
		this._sprites[1].height = newHigth;
		this._sprites[1].y = this._sprite.y + this._sprite.height;
		this._sprites[1].x = size * 3 - (this._sprites[0].width / 2);

			
			
		for (let i = 0; i < 2; i++) {
			containerSprite.addChild(this._sprites[i]);
		}
		container.addChild(this._sprite, containerSprite);
		return container;


	}

	private _initLineTournament8 (container: PIXI.Container) {
		const size = (this.root.width / 4);
		const pourcentage = 25;
		const newWidth = ((this.root.width * pourcentage) / 100);
		const ratio = this._sprite.width / this._sprite.height;
		const newHigth = newWidth / ratio;
		
		for (let i = 0; i < 6; i++){
			this._sprites[i] = new PIXI.Sprite(tournamentLine);
		}

		this._sprite.width = newWidth * 2;
		this._sprite.height = newHigth;
		this._sprite.x = this.root.width / 2 - this._sprite.width / 2;
		this._sprite.y = (this.root.height * 18) / 100;

		const containerSprite = new PIXI.Container();

		this._sprites[0].width = newWidth;
		this._sprites[0].height = newHigth;
		this._sprites[0].y = this._sprite.y + this._sprite.height;
		this._sprites[0].x = ((size)) - this._sprites[0].width / 2;

		this._sprites[1].width = newWidth;
		this._sprites[1].height = newHigth;
		this._sprites[1].y = this._sprite.y + this._sprite.height;
		this._sprites[1].x = ((size * 3)) - (this._sprites[1].width / 2);
			
		for (let i = 0; i < 2; i++) {
			containerSprite.addChild(this._sprites[i]);
		}

		const containerSprite4 = new PIXI.Container();

		this._sprites[2].width = newWidth;
		this._sprites[2].height = newHigth;
		this._sprites[2].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[2].x = ((size) - size / 2) - this._sprites[2].width / 2;

		this._sprites[3].width = newWidth;
		this._sprites[3].height = newHigth;
		this._sprites[3].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[3].x = ((size * 2) - size / 2) - (this._sprites[3].width / 2);
		
		this._sprites[4].width = newWidth;
		this._sprites[4].height = newHigth;
		this._sprites[4].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[4].x = ((size * 3) - size / 2) - (this._sprites[4].width / 2);
		
		this._sprites[5].width = newWidth;
		this._sprites[5].height = newHigth;
		this._sprites[5].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[5].x = ((size * 4) - size / 2) - (this._sprites[5].width / 2);
			
		for (let i = 2; i < 6; i++) {
			containerSprite4.addChild(this._sprites[i]);
		}
		container.addChild(this._sprite, containerSprite, containerSprite4);
		return container;
	}


	private _initNameVs4(names: PIXI.Container) {

		const playerName = this.root.currentTournament?.participants;
		console.log(this.root.currentTournament);
		
		if (playerName) {
				for (let i = 0; i < playerName.length; i++) {
					while (i < 2) {
						console.log(playerName[i]);
						const newName = new PIXI.Text(playerName[i]);
						newName.style.fontSize = (this.root.width * 2) / 100;
						newName.y =  (this.root.height * 65) / 100;
						newName.x = ((this.root.width * 10) / 100) + i * ((this.root.width * 20) / 100);
						newName.style.fill = defaultColor;
						newName.filters = [glowFilter];
						this._nameVs[i] = newName;
						i++;
					}

					let j = 0;
					while (i < 4) {
						console.log(playerName[i]);
						const newName = new PIXI.Text(playerName[i]);
					
						newName.style.fontSize = (this.root.width * 2) / 100;
						newName.y =  (this.root.height * 65) / 100;
						newName.x = ((this.root.width * 60) / 100) + j * ((this.root.width * 20) / 100);
						newName.style.fill = defaultColor;
						newName.filters = [glowFilter];
						this._nameVs[i] = newName;
						j++;
						i++;
					}
			}
		}
		for (let i = 0; i < this._nameVs.length; i++) {
			names.addChild(this._nameVs[i]);
		}
		return names;
	}


	private _initNameVs8(names: PIXI.Container) {

		const playerName = this.root.currentTournament?.participants;
		console.log(this.root.currentTournament);
		
		if (playerName) {
				for (let i = 0; i < playerName.length; i++) {
					while (i < 8) {
						console.log(playerName[i]);
						const newName = new PIXI.Text(playerName[i]);
						const adjustment = (this.root.height * 70 * 0.03) / 100;
						newName.style.fontSize = (this.root.width * 2) / 100;
						newName.y = (this.root.height * 70) / 100 + (i % 2 === 1 ? adjustment : 0);
						newName.x = ((this.root.width * 2) / 100) + i * ((this.root.width * 12.2) / 100);
						newName.style.fill = defaultColor;
						newName.filters = [glowFilter];
						this._nameVs[i] = newName;
						i++;
					}
			}
		}
		for (let i = 0; i < this._nameVs.length; i++) {
			names.addChild(this._nameVs[i]);
		}
		return names;
	}




	//=======================================
	// UTILS
	//=======================================



}
