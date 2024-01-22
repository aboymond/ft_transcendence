// import { Container } from 'react-bootstrap';
import { defaultColor } from '..';
import { SceneBase } from './SceneBase';
import * as PIXI from 'pixi.js';
import { glowFilter } from '..' ;
import apiService from '../../src/services/apiService';




export class SceneJoin extends SceneBase {
	
	private _textJoin = new PIXI.Text("JOIN");
	private _textTab = new PIXI.Text("NAME           | MODE           | PLAYERS");
	private _line = '';
	private _lineUnder = new PIXI.Text("");
	private _join = new PIXI.Container();
	private _tournamentObjects: Array<{container:PIXI.Container, data: any}> = [];
	private _gameObjects: Array<{container:PIXI.Container, data: any}> = [];
	private _selectionLength = 0;
	private _currentSelect = 0;

	//=======================================
	// HOOK
	//=======================================

	public async onStart(container: PIXI.Container) {
		container.addChild(this._initTextJoin(this._textJoin));
		container.addChild(this._initTextTab(this._textTab));

		for (let line = 0; line < this.root.width; line++) {
			this._line += '_';
		}
		this._lineUnder = new PIXI.Text(this._line);
		container.addChild(this._initLine(this._lineUnder));

		this._join = await this._initMenuJoin();
		container.addChild(this._join);
	}

	public onUpdate() {

	}

	public onFinish() {}

	public onKeyDown(e: KeyboardEvent) {

		if (e.code === 'ArrowUp') {
			this._currentSelect--;
			if (this._currentSelect < 0)
				this._currentSelect = this._selectionLength;
		}

		if (e.code === 'ArrowDown') {
			this._currentSelect++;

		}
	}




	public onKeyUp() {}

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

	private async _initMenuJoin(): Promise < PIXI.Container > {
		const menu = new PIXI.Container();
		this._tournamentObjects = [];
		const tournaments = await apiService.getTournaments();
		const games = await apiService.getGames();
		this._selectionLength = tournaments.length - 1;
		console.log("lenght " + this._selectionLength);

		console.log(tournaments);
		console.log(games);

		apiService.getGames().then(games => {
			games.forEach(game => {
				console.log(game.player1.username);
			});
		});
		// const player = apiService.getUser(games.palyer1);

		// console.log(player);

		for (let i =  0; i < tournaments.length; i++) {

			const menuBox = new PIXI.Graphics();
			const tournament = tournaments[i];
			const textName_tour = new PIXI.Text(tournament.name);
			const textMode_tour = new PIXI.Text("Tournament");
			const textInfo_tour = new PIXI.Text(tournament.participants.length + "/" + tournament.max_participants);

			
			textName_tour.style.fontSize = (this.root.width * 4) / 100;
			textName_tour.style.fill = defaultColor;
			textName_tour.filters = [glowFilter];

			textMode_tour.x = (this.root.width / 2 - textMode_tour.width / 2);
			textMode_tour.style.fontSize = (this.root.width * 4) / 100;
			textMode_tour.style.fill = defaultColor;
			textMode_tour.filters = [glowFilter];


			textInfo_tour.x = this.root.width - 120;
			textInfo_tour.style.fontSize = (this.root.width * 4) / 100;
			textInfo_tour.style.fill = defaultColor;
			textInfo_tour.filters = [glowFilter];

			
			menuBox.x = 10;
			menuBox.y = (this.root.height * 20) / 100 + (i * 25);
			menuBox.endFill();
			menuBox.addChild(textName_tour, textMode_tour, textInfo_tour);
			menu.addChild(menuBox);
			

			this._tournamentObjects.push({container: menuBox, data: tournament})

		}


		// menu.visible = false;

		return menu;
	}

}
