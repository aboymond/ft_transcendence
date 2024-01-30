import { defaultColor, glowFilter } from '..';
import { SceneBase } from './SceneBase';
import { SceneMenu } from './SceneMenu';
import { SceneWinOrLoose } from './SceneWinOrLoose';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiManager } from '../PixiManager';



// const tournamentLine = PIXI.Texture.from('gameV2/img/tourmnamentLine.png');



export class SceneTournamentLoadingVs extends SceneBase {


	private tournamentLines: Array<{lines: PIXI.Sprite}>
	

	//=======================================
	// HOOK
	//=======================================



	public async onStart(container: PIXI.Container) {

		

	}
	
	public onUpdate() {
		
	}

	public onFinish() {

	}

	public onKeyDown(e: KeyboardEvent) {

	}

	public onKeyUp() {
	}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initLineTournament () {

		if (this.root.currentTournament?.max_participants === 4) {
			for ()
		}
		this.tournamentLines = [];



	}





	//=======================================
	// UTILS
	//=======================================



}
