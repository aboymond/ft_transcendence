// import { Container } from 'react-bootstrap';
import { defaultColor } from '..';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import * as PIXI from 'pixi.js';
import apiService from '../../src/services/apiService';
import { SceneLoadingPage } from './SceneLoadingPage';
import { Tournament, Game } from '../../src/types';
// import { SceneGame } from './SceneGame';
import { SceneTournamentLoadingVs } from './SceneTournamentLoadingVs';
import {AudioManager} from '../AudioManager';


enum menuState {
	TOURN_MENU,
	PVP_MENU,
}

export class SceneJoin extends SceneBase {
	private _state: menuState = menuState.TOURN_MENU;
	private _tourn_container = new PIXI.Container();
	private _pvp_container = new PIXI.Container();
	private _textTournament = new PIXI.Text('TOURNAMENT');
	private _textPVP = new PIXI.Text('PVP');
	private _textTabName = new PIXI.Text('NAME');
	private _textTabMaxScore = new PIXI.Text('| MAX SCORE');
	private _textTabPlayers = new PIXI.Text('| PLAYERS');
	private _line = '';
	private _lineUnder = new PIXI.Text('');
	private _tournamentObjects: Array<{ container: PIXI.Container; data: Tournament }> = [];
	private _gameObjects: Array<{ container: PIXI.Container; data: Game }> = [];
	private _currentSelectTournament = -1;
	private _currentSelectPvP = -1;

	//=======================================
	// HOOK
	//=======================================

	public async onStart(container: PIXI.Container) {
		container.addChild(this._initTextJoin(this._textTournament));
		container.addChild(this._initTextPvP(this._textPVP));
		container.addChild(this._initTextTabName(this._textTabName));
		container.addChild(this._initTextTabMaxScore(this._textTabMaxScore));
		container.addChild(this._initTextTabPlayer(this._textTabPlayers));

		for (let line = 0; line < this.root.width; line++) {
			this._line += '_';
		}
		this._lineUnder = new PIXI.Text(this._line);
		container.addChild(this._initLine(this._lineUnder));

		this._tourn_container = await this._initMenuJoinTournament();
		container.addChild(this._tourn_container);
		this._pvp_container = await this._initMenuJoinPvP();
		container.addChild(this._pvp_container);
	}

	public onUpdate() {}

	public onFinish() {
		AudioManager.reset();
	}

	public onKeyDown(e: KeyboardEvent) {
		// console.log(this.state);
		switch (this._state) {
			case menuState.TOURN_MENU:
				if (e.key === 'ArrowRight') {
					AudioManager.play('select');

					this._tourn_container.visible = false;
					this._pvp_container.visible = true;
					this._textTournament.style.fill = 'green';
					this._textPVP.style.fill = defaultColor;
					this._state = menuState.PVP_MENU;
				}
				if (e.key === 'ArrowDown') {
					AudioManager.play('select');
					this._pressDownTournament();
				}
				if (e.key === 'ArrowUp') {
					AudioManager.play('select');
					this._pressUpTournament();
				}
				if (e.code === 'Enter') {
					if (this._tournamentObjects.length > 0 && this._currentSelectTournament >= 0) {
						AudioManager.play('enter');
						this._joinTournament(this._tournamentObjects[this._currentSelectTournament].data.id);
					}
				}
				if (e.code === 'Escape') {
					this.root.loadScene(new SceneMenu2(this.root));
				}
				break;
			case menuState.PVP_MENU:
				if (e.key === 'ArrowLeft') {
					AudioManager.play('select');

					this._tourn_container.visible = true;
					this._pvp_container.visible = false;
					this._textTournament.style.fill = defaultColor;
					this._textPVP.style.fill = 'green';
					this._state = menuState.TOURN_MENU;
				}
				if (e.key === 'ArrowDown') {
					AudioManager.play('select');
					this._pressDownPvP();
				}
				if (e.key === 'ArrowUp') {
					AudioManager.play('select');
					this._pressUpPvP();
				}
				if (e.code === 'Enter') {
					if (this._gameObjects.length > 0 && this._currentSelectPvP >= 0) {
						AudioManager.play('enter');
						this._joinGame(this._gameObjects[this._currentSelectPvP].data.id);
					}
				}
				if (e.code === 'Escape') {
					this.root.loadScene(new SceneMenu2(this.root));
				}
				break;
		}
	}

	public onKeyUp() {}

	private _pressDownTournament() {
		if (this._currentSelectTournament > this._tournamentObjects.length - 2) {
			return;
		} else this._currentSelectTournament++;

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
		console.log('UP: ' + this._currentSelectTournament);
		if (this._currentSelectTournament < 1) {
			return;
		} else this._currentSelectTournament--;

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

	private _pressDownPvP() {
		if (this._currentSelectPvP > this._gameObjects.length - 2) {
			return;
		} else this._currentSelectPvP++;
		let selectedPvP = this._gameObjects[this._currentSelectPvP];
		if (!selectedPvP) {
			return;
		}

		for (let i = 0; i < selectedPvP.container.children.length; i++) {
			const textName = selectedPvP.container.getChildAt(i) as PIXI.Text;
			textName.style.fill = defaultColor;
		}

		if (this._currentSelectPvP != 0) {
			selectedPvP = this._gameObjects[this._currentSelectPvP - 1];
			for (let i = 0; i < selectedPvP.container.children.length; i++) {
				const textName = selectedPvP.container.getChildAt(i) as PIXI.Text;
				textName.style.fill = 'green';
			}
		}
	}

	private _pressUpPvP() {
		if (this._currentSelectPvP < 1) {
			return;
		} else this._currentSelectPvP--;

		let selectedPvP = this._gameObjects[this._currentSelectPvP];

		if (!selectedPvP) {
			return;
		}

		for (let i = 0; i < selectedPvP.container.children.length; i++) {
			const textName = selectedPvP.container.getChildAt(i) as PIXI.Text;
			textName.style.fill = defaultColor;
		}

		if (this._currentSelectPvP != this._gameObjects.length - 1) {
			selectedPvP = this._gameObjects[this._currentSelectPvP + 1];
			for (let i = 0; i < selectedPvP.container.children.length; i++) {
				const textName = selectedPvP.container.getChildAt(i) as PIXI.Text;
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
		return text;
	}

	private _initTextPvP(text: PIXI.Text) {
		text.x = (this.root.width * 70) / 100 - text.width / 2;
		text.y = (this.root.height * 5) / 100;
		text.style.fontSize = (this.root.width * 5) / 100;
		text.style.fill = 'green';
		return text;
	}

	private _initTextTabName(tab: PIXI.Text) {
		tab.x = (this.root.width * 2) / 100;
		tab.y = (this.root.height * 15) / 100;
		tab.style.fontSize = (this.root.width * 4) / 100;
		tab.style.fill = defaultColor;
		return tab;
	}

	private _initTextTabMaxScore(tab: PIXI.Text) {
		tab.x = (this.root.width * 35) / 100;
		tab.y = (this.root.height * 15) / 100;
		tab.style.fontSize = (this.root.width * 4) / 100;
		tab.style.fill = defaultColor;
		return tab;
	}

	private _initTextTabPlayer(tab: PIXI.Text) {
		tab.x = (this.root.width * 75) / 100;
		tab.y = (this.root.height * 15) / 100;
		tab.style.fontSize = (this.root.width * 4) / 100;
		tab.style.fill = defaultColor;
		return tab;
	}

	private _initLine(line: PIXI.Text) {
		// line.x = (this.root.width * 10) / 100;
		line.y = (this.root.height * 16) / 100;
		line.style.fontSize = (this.root.width * 4) / 100;
		line.style.fill = defaultColor;
		return line;
	}

	private async _initMenuJoinTournament(): Promise<PIXI.Container> {
		const menu = new PIXI.Container();
		this._tournamentObjects = [];
		const tournaments = await apiService.getTournaments();
		const waitingTournaments = tournaments.filter(
			(tournament: Tournament) => tournament.status === 'waiting',
		);
		for (let i = 0; i < waitingTournaments.length; i++) {
			const menuBoxTournament = new PIXI.Graphics();
			const tournament = waitingTournaments[i];
			// console.log(tournament);
			const textName_tour = new PIXI.Text(tournament.name);
			const textMode_tour = new PIXI.Text(tournament.max_score);
			const textInfo_tour = new PIXI.Text(tournament.participants.length + '/' + tournament.max_participants);

			textName_tour.x = (this.root.width * 2) / 100;
			textName_tour.style.fontSize = (this.root.width * 4) / 100;
			textName_tour.style.fill = 'green';

			textMode_tour.x = (this.root.width * 35) / 100 + 5;
			textMode_tour.style.fontSize = (this.root.width * 4) / 100;
			textMode_tour.style.fill = 'green';

			textInfo_tour.x = (this.root.width * 75) / 100 + 5;
			textInfo_tour.style.fontSize = (this.root.width * 4) / 100;
			textInfo_tour.style.fill = 'green';

			// menuBoxTournament.x = 10;
			menuBoxTournament.y = (this.root.height * 20) / 100 + i * 25;
			menuBoxTournament.endFill();
			menuBoxTournament.addChild(textName_tour, textMode_tour, textInfo_tour);

			this._tournamentObjects.push({ container: menuBoxTournament, data: tournament });
			menu.addChild(menuBoxTournament);
		}
		menu.visible = true;

		return menu;
	}

	private async _initMenuJoinPvP(): Promise<PIXI.Container> {
		const menu = new PIXI.Container();
		this._gameObjects = [];
		const games = await apiService.getGames();
		// Filter games to only include those with status "waiting"
		const waitingGames = games.filter((game: Game) => game.status === 'waiting');

		for (let i = 0; i < waitingGames.length; i++) {
			const menuBoxPvP = new PIXI.Graphics();
			const game = waitingGames[i];

			const textName_PvP = new PIXI.Text(game.player1);
			const textMode_PvP = new PIXI.Text(game.max_score);
			let player2 = 0;

			if (game.player2 != null) player2 = 1;
			const textInfo_PvP = new PIXI.Text(player2 + 1 + '/2');

			textName_PvP.x = (this.root.width * 2) / 100;
			textName_PvP.style.fontSize = (this.root.width * 4) / 100;
			textName_PvP.style.fill = 'green';

			textMode_PvP.x = (this.root.width * 35) / 100 + 5;
			textMode_PvP.style.fontSize = (this.root.width * 4) / 100;
			textMode_PvP.style.fill = 'green';

			textInfo_PvP.x = (this.root.width * 75) / 100 + 5;
			textInfo_PvP.style.fontSize = (this.root.width * 4) / 100;
			textInfo_PvP.style.fill = 'green';

			menuBoxPvP.y = (this.root.height * 20) / 100 + i * 25;
			menuBoxPvP.endFill();
			menuBoxPvP.addChild(textName_PvP, textMode_PvP, textInfo_PvP);

			this._gameObjects.push({ container: menuBoxPvP, data: game });
			menu.addChild(menuBoxPvP);
		}
		menu.visible = false;

		return menu;
	}

	private _joinGame(gameId: number) {
		apiService
			.joinGame(gameId, this.root.userId ?? 0)
			.then(() => {
				this.root.loadScene(new SceneLoadingPage(this.root, gameId));
			})
			.catch(() => this.root.loadScene(new SceneJoin(this.root)));
	}
	private _joinTournament(tournamentId: number) {
		apiService
			.joinTournament(tournamentId, this.root.userId ?? 0)
			.then(() => {
				this.root.loadScene(new SceneTournamentLoadingVs(this.root, tournamentId));
			})
			.catch(() => this.root.loadScene(new SceneJoin(this.root)));
	}
}
