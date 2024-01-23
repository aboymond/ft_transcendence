// import { Container } from 'react-bootstrap';
import { defaultColor } from '..';
import { SceneBase } from './SceneBase';
import * as PIXI from 'pixi.js';
import { glowFilter } from '..' ;
import apiService from '../../src/services/apiService';

enum menuState {
	TOURN_MENU,
	PVP_MENU,
}



export class SceneJoin extends SceneBase {
	
	private state: menuState = menuState.TOURN_MENU;
	private _tourn_container = new PIXI.Container();
	private _pvp_container = new PIXI.Container();
	private _textTournament = new PIXI.Text("TOURNAMENT");
	private _textPVP = new PIXI.Text("PVP");
	private _textTab = new PIXI.Text("NAME           | MODE           | PLAYERS");
	private _line = '';
	private _lineUnder = new PIXI.Text("");
	private _tournamentObjects: Array<{container:PIXI.Container, data: any}> = [];
	private _gameObjects: Array<{container:PIXI.Container, data: any}> = [];
	private _currentSelectTournament = -1;
	private _currentSelectPvP = -1;
	// private _menuBoxTournament: any;
	// private _menuBoxPvP: any;
	// private _allLength = 0;


	
	//=======================================
	// HOOK
	//=======================================
	
	public async onStart(container: PIXI.Container) {
		container.addChild(this._initTextJoin(this._textTournament));
		container.addChild(this._initTextPvP(this._textPVP));
		container.addChild(this._initTextTab(this._textTab));


		for (let line = 0; line < this.root.width; line++) {
			this._line += '_';
		}
		this._lineUnder = new PIXI.Text(this._line);
		container.addChild(this._initLine(this._lineUnder));

		this._tourn_container = await this._initMenuJoinTournament();
		container.addChild(this._tourn_container);
		// this._pvp_container = await this._initMenuJoinPvP();
		// container.addChild(this._pvp_container);


	}

	public onUpdate() {

	}

	public onFinish() {}

	public onKeyDown(e: KeyboardEvent) {
		// console.log(this.state);
		switch (this.state) {
			case menuState.TOURN_MENU:

				if (e.key === 'ArrowRight') {
					console.log("right");
					this._tourn_container.visible = false;
					this._pvp_container.visible = true;
					this._textTournament.style.fill = 'green';
					this._textPVP.style.fill = defaultColor;
					this.state = menuState.PVP_MENU;
				}
				if (e.key === 'ArrowDown' ) {
					this._pressDownTournament();
				}
				if(e.key === 'ArrowUp') {
					this._pressUpTournament();
				}
				break;
			case menuState.PVP_MENU:
				if (e.key === 'ArrowLeft') {
					console.log("left");
					this._tourn_container.visible = true;
					this._pvp_container.visible = false;
					this._textTournament.style.fill = defaultColor;
					this._textPVP.style.fill = 'green';
					this.state = menuState.TOURN_MENU;
				}
				if (e.key === 'ArrowDown' && this._currentSelectPvP === -1 ) {
					this._currentSelectPvP++;
					this._pressDown();
				}

				break;
			
		}
	}

	public onKeyUp() {}


	private _pressDownTournament() {

		if (this._currentSelectTournament > this._tournamentObjects.length - 2) {
			return;
		}
		else
			this._currentSelectTournament++;
	
		let selectedTournament = this._tournamentObjects[this._currentSelectTournament];
	
		if (!selectedTournament) {
			return;
		}
	
		for (let i = 0; i < selectedTournament.container.children.length; i++) {
			const textName = selectedTournament.container.getChildAt(i) as PIXI.Text;
			textName.style.fill = defaultColor;
		}
		
		if (this._currentSelectTournament != 0) {
			selectedTournament = this._tournamentObjects[this._currentSelectTournament - 1];
			for (let i = 0; i < selectedTournament.container.children.length; i++) {
				const textName = selectedTournament.container.getChildAt(i) as PIXI.Text;
				textName.style.fill = 'green';
			}
		}
	}

	private _pressUpTournament() {
		console.log("UP: " + this._currentSelectTournament);
		if (this._currentSelectTournament < 1) {
			return;
		}
		else 
			this._currentSelectTournament--;
	
		let selectedTournament = this._tournamentObjects[this._currentSelectTournament];
	
		if (!selectedTournament) {
			return;
		}
	
		for (let i = 0; i < selectedTournament.container.children.length; i++) {
			const textName = selectedTournament.container.getChildAt(i) as PIXI.Text;
			textName.style.fill = defaultColor;
		}
		
		if (this._currentSelectTournament != this._tournamentObjects.length - 1) {
			selectedTournament = this._tournamentObjects[this._currentSelectTournament + 1];
			for (let i = 0; i < selectedTournament.container.children.length; i++) {
				const textName = selectedTournament.container.getChildAt(i) as PIXI.Text;
				textName.style.fill = 'green';
			}
		}
	}





	//=======================================
	// UTILS INIT
	//=======================================

	private _initTextJoin(text: PIXI.Text) {
		text.x = (this.root.width * 10) / 100;
		text.y = (this.root.height * 5) / 100;
		text.style.fontSize = (this.root.width * 5) / 100;
		text.style.fill = defaultColor;
		text.filters = [glowFilter];
		return text;
	}

	private _initTextPvP(text: PIXI.Text) {
		text.x = (this.root.width * 70) / 100 - text.width / 2;
		text.y = (this.root.height * 5) / 100;
		text.style.fontSize = (this.root.width * 5) / 100;
		text.style.fill = 'green';
		text.filters = [glowFilter];
		return text;
	}

	private _initTextTab(tab: PIXI.Text) {
		tab.x = (this.root.width * 10) / 100;
		tab.y = (this.root.height * 15) / 100;
		tab.style.fontSize = (this.root.width * 4) / 100;
		tab.style.fill = defaultColor;
		tab.filters = [glowFilter];
		return tab;
	}

	private _initLine(line: PIXI.Text) {
		// line.x = (this.root.width * 10) / 100;
		line.y = (this.root.height * 16) / 100;
		line.style.fontSize = (this.root.width * 4) / 100;
		line.style.fill = defaultColor;
		line.filters = [glowFilter];
		return line;
	}

	private async _initMenuJoinTournament(): Promise < PIXI.Container > {

		const menu = new PIXI.Container();
		this._tournamentObjects = [];
		const tournaments = await apiService.getTournaments();



		for (let i =  0; i < tournaments.length; i++) {
			
			const menuBoxTournament = new PIXI.Graphics();
			const tournament = tournaments[i];
			const textName_tour = new PIXI.Text(tournament.name);
			const textMode_tour = new PIXI.Text("Tournament");
			const textInfo_tour = new PIXI.Text(tournament.participants.length + "/" + tournament.max_participants);

			textName_tour.style.fontSize = (this.root.width * 4) / 100;
			textName_tour.style.fill = "green";
			textName_tour.filters = [glowFilter];

			textMode_tour.x = (this.root.width / 2 - textMode_tour.width / 2);
			textMode_tour.style.fontSize = (this.root.width * 4) / 100;
			textMode_tour.style.fill = "green";
			textMode_tour.filters = [glowFilter];


			textInfo_tour.x = this.root.width - 120;
			textInfo_tour.style.fontSize = (this.root.width * 4) / 100;
			textInfo_tour.style.fill = "green";
			textInfo_tour.filters = [glowFilter];


			
			menuBoxTournament.x = 10;
			menuBoxTournament.y = (this.root.height * 20) / 100 + (i * 25);
			menuBoxTournament.endFill();
			menuBoxTournament.addChild(textName_tour, textMode_tour, textInfo_tour);
			
			this._tournamentObjects.push({container: menuBoxTournament, data: tournament});
			menu.addChild(menuBoxTournament);
			
		}
		menu.visible = true;


		return menu;
	}

	// private async _initMenuJoinPvP(): Promise < PIXI.Container > {
	// 	const menu = new PIXI.Container();
	// 	this._tournamentObjects = [];
	// 	const tournaments = await apiService.getTournaments();
	// 	this._tournamentLength = tournaments.length - 1;
	// 	// const games = await apiService.getGames();
	// 	// this._allLength = (tournaments.length - 1) + (games.length - 1);

	// 	console.log(this._tournamentLength);


	// 	for (let i =  0; i < 1; i++) {
			
	// 		this._menuBoxPvP = new PIXI.Graphics();
	// 		const tournament = tournaments[i];
	// 		const textName_tour = new PIXI.Text(tournament.name);
	// 		const textMode_tour = new PIXI.Text("Tournament");
	// 		const textInfo_tour = new PIXI.Text(tournament.participants.length + "/" + tournament.max_participants);



			
	// 		textName_tour.style.fontSize = (this.root.width * 4) / 100;
	// 		textName_tour.style.fill = defaultColor;
	// 		textName_tour.filters = [glowFilter];

	// 		textMode_tour.x = (this.root.width / 2 - textMode_tour.width / 2);
	// 		textMode_tour.style.fontSize = (this.root.width * 4) / 100;
	// 		textMode_tour.style.fill = defaultColor;
	// 		textMode_tour.filters = [glowFilter];


	// 		textInfo_tour.x = this.root.width - 120;
	// 		textInfo_tour.style.fontSize = (this.root.width * 4) / 100;
	// 		textInfo_tour.style.fill = defaultColor;
	// 		textInfo_tour.filters = [glowFilter];


			
	// 		this._menuBoxPvP.x = 10;
	// 		this._menuBoxPvP.y = (this.root.height * 20) / 100 + (i * 25);
	// 		this._menuBoxPvP.endFill();
	// 		this._menuBoxPvP.addChild(textName_tour, textMode_tour, textInfo_tour);
			
			
	// 		this._tournamentObjects.push({container: this._menuBoxPvP, data: tournament})
	// 		menu.addChild(this._menuBoxPvP);
			
	// 	}
	// 	menu.visible = false;

	// 	return menu;
	// }

}
