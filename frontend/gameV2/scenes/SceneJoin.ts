// import { Container } from 'react-bootstrap';
import { defaultColor } from '..';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import * as PIXI from 'pixi.js';
import { glowFilter } from '..';
import apiService from '../../src/services/apiService';
import { SceneLoadingPage } from './SceneLoadingPage';
import { Tournament, Game } from '../../src/types';
// import { SceneGame } from './SceneGame';
import { SceneTournamentLoadingVs } from './SceneTournamentLoadingVs';
import { sound } from '@pixi/sound';

enum menuState {
	TOURN_MENU,
	PVP_MENU,
}

// interface objectData {
// 	max_participents: number;
// }

export class SceneJoin extends SceneBase {
	private state: menuState = menuState.TOURN_MENU;
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
		sound.add('select', './sound/Select.mp3');
		sound.add('enter', './sound/game-start.mp3');

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

	public onFinish() {}

	public onKeyDown(e: KeyboardEvent) {
		// console.log(this.state);
		switch (this.state) {
			case menuState.TOURN_MENU:
				if (e.key === 'ArrowRight') {
					sound.play('select');

					this._tourn_container.visible = false;
					this._pvp_container.visible = true;
					this._textTournament.style.fill = 'green';
					this._textPVP.style.fill = defaultColor;
					this.state = menuState.PVP_MENU;
				}
				if (e.key === 'ArrowDown') {
					sound.play('select');
					this._pressDownTournament();
				}
				if (e.key === 'ArrowUp') {
					sound.play('select');
					this._pressUpTournament();
				}
				if (e.code === 'Enter') {
					sound.play('enter');
					// this._initCurrentTournament();
					this.root.loadScene(new SceneTournamentLoadingVs(this.root));
				}
				if (e.code === 'Escape') {
					this.root.loadScene(new SceneMenu2(this.root));
				}
				break;
			case menuState.PVP_MENU:
				if (e.key === 'ArrowLeft') {
					sound.play('select');

					this._tourn_container.visible = true;
					this._pvp_container.visible = false;
					this._textTournament.style.fill = defaultColor;
					this._textPVP.style.fill = 'green';
					this.state = menuState.TOURN_MENU;
				}
				if (e.key === 'ArrowDown') {
					sound.play('select');
					this._pressDownPvP();
				}
				if (e.key === 'ArrowUp') {
					sound.play('select');
					this._pressUpPvP();
				}
				if (e.code === 'Enter') {
					sound.play('enter');

					console.log(this._gameObjects[this._currentSelectPvP].data.id);
					this._joinGame(this._gameObjects[this._currentSelectPvP].data.id);
				}
				if (e.code === 'Escape') {
					this.root.loadScene(new SceneMenu2(this.root));
				}
				if (e.code === 'Enter') {
					if (this._gameObjects[this._currentSelectPvP]) {
						this._joinGame(this._gameObjects[this._currentSelectPvP].data.id);
					}
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

	private _initTextTabName(tab: PIXI.Text) {
		tab.x = (this.root.width * 2) / 100;
		tab.y = (this.root.height * 15) / 100;
		tab.style.fontSize = (this.root.width * 4) / 100;
		tab.style.fill = defaultColor;
		tab.filters = [glowFilter];
		return tab;
	}

	private _initTextTabMaxScore(tab: PIXI.Text) {
		tab.x = (this.root.width * 35) / 100;
		tab.y = (this.root.height * 15) / 100;
		tab.style.fontSize = (this.root.width * 4) / 100;
		tab.style.fill = defaultColor;
		tab.filters = [glowFilter];
		return tab;
	}

	private _initTextTabPlayer(tab: PIXI.Text) {
		tab.x = (this.root.width * 75) / 100;
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

	private async _initMenuJoinTournament(): Promise<PIXI.Container> {
		const menu = new PIXI.Container();
		this._tournamentObjects = [];
		const tournaments = await apiService.getTournaments();

		for (let i = 0; i < tournaments.length; i++) {
			const menuBoxTournament = new PIXI.Graphics();
			const tournament = tournaments[i];
			// console.log(tournament);
			const textName_tour = new PIXI.Text(tournament.name);
			const textMode_tour = new PIXI.Text(tournament.max_score);
			const textInfo_tour = new PIXI.Text(tournament.participants.length + '/' + tournament.max_participants);

			textName_tour.x = (this.root.width * 2) / 100;
			textName_tour.style.fontSize = (this.root.width * 4) / 100;
			textName_tour.style.fill = 'green';
			textName_tour.filters = [glowFilter];

			textMode_tour.x = (this.root.width * 35) / 100 + 5;
			textMode_tour.style.fontSize = (this.root.width * 4) / 100;
			textMode_tour.style.fill = 'green';
			textMode_tour.filters = [glowFilter];

			textInfo_tour.x = (this.root.width * 75) / 100 + 5;
			textInfo_tour.style.fontSize = (this.root.width * 4) / 100;
			textInfo_tour.style.fill = 'green';
			textInfo_tour.filters = [glowFilter];

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
		let j = 0;

		for (let i = 0; i < games.length; i++) {
			const menuBoxPvP = new PIXI.Graphics();
			const game = games[i];

			// console.log(game);
			if (game.status === 'completed') {
				i++;
			} else {
				//TODO: use game.player1.username
				// const textName_PvP = new PIXI.Text(game.player1 ? game.player1.username : 'Waiting for Player');
				const textName_PvP = new PIXI.Text(game.player1);
				//TODO: use this
				// const textMode_PvP = new PIXI.Text(game.max_score.toString());
				const textMode_PvP = new PIXI.Text(game.max_score);
				let player2 = 0;

				if (game.player2 != null) player2 = 1;
				const textInfo_PvP = new PIXI.Text(player2 + 1 + '/2');

				textName_PvP.x = (this.root.width * 2) / 100;
				textName_PvP.style.fontSize = (this.root.width * 4) / 100;
				textName_PvP.style.fill = 'green';
				textName_PvP.filters = [glowFilter];

				textMode_PvP.x = (this.root.width * 35) / 100 + 5;
				textMode_PvP.style.fontSize = (this.root.width * 4) / 100;
				textMode_PvP.style.fill = 'green';
				textMode_PvP.filters = [glowFilter];

				textInfo_PvP.x = (this.root.width * 75) / 100 + 5;
				textInfo_PvP.style.fontSize = (this.root.width * 4) / 100;
				textInfo_PvP.style.fill = 'green';
				textInfo_PvP.filters = [glowFilter];

				menuBoxPvP.y = (this.root.height * 20) / 100 + j * 25;
				menuBoxPvP.endFill();
				menuBoxPvP.addChild(textName_PvP, textMode_PvP, textInfo_PvP);

				this._gameObjects.push({ container: menuBoxPvP, data: game });
				menu.addChild(menuBoxPvP);
				j++;
			}
		}
		menu.visible = false;

		return menu;
	}

	// private _initCurrentTournament() {
	// 	if (this._currentSelectTournament < 0) return;
	// 	this.root.currentTournament = this._tournamentObjects[this._currentSelectTournament].data;
	// 	console.log(this.root.currentTournament?.max_participants);
	// }

	private _joinGame(gameId: number) {
		apiService
			.joinGame(gameId, this.root.userId ?? 0)
			.then((response) => {
				console.log('Joined game successfully', response);
				this.root.openGameSocket(response.id);
			})
			.catch((error) => console.error('Error joining game', error));
		this.root.loadScene(new SceneLoadingPage(this.root, gameId));
	}
}
