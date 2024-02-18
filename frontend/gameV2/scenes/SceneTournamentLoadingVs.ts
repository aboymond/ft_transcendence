import { defaultColor, glowFilter } from '..';
import { SceneBase } from './SceneBase';
import { SceneMenu2 } from './SceneMenu2';
import * as PIXI from 'pixi.js';
import { PixiManager } from '../PixiManager';
import apiService from '../../src/services/apiService';
import { Tournament } from '../../src/types';
import { Match } from '../../src/types';
import { SceneLoadingPage } from './SceneLoadingPage';

const tournamentLine = PIXI.Texture.from('./img/tournamentLine.png');

export class SceneTournamentLoadingVs extends SceneBase {
	// TITlE
	private _standings = new PIXI.Text('< STANDINGS >');

	//SPRITES
	private _containerSprite = new PIXI.Container();
	private _sprites: PIXI.Sprite[] = [];
	private _sprite = new PIXI.Sprite(tournamentLine);

	//NAME VS
	private _nameVs: PIXI.Text[] = [];
	private _containerNames = new PIXI.Container();
	private _containerMatches = new PIXI.Container();

	private _currentTournament: Tournament | null = null;
	private _currentMatches: Match[] = [];

	private _checkInterval: number | null = null;

	private _winner: string = '';

	constructor(
		root: PixiManager,
		private _tournamentId: number,
	) {
		super(root);
	}

	//=======================================
	// HOOK
	//=======================================

	public async onStart(container: PIXI.Container) {
		this._initTextStandings(this._standings);
		container.addChild(this._standings);
		this._initEnterText(container);

		this.root.playSound('loading');

		// Fetch the current tournament state
		const currentTournament = await apiService.getTournament(this._tournamentId);
		if (currentTournament) {
			this._currentTournament = currentTournament;
			this._setupTournamentDisplay(container); // Setup initial display based on current tournament state
		}

		//TODO use websocket to update the display
		// Periodic check to update the display
		this._checkInterval = window.setInterval(async () => {
			const updatedTournament = await apiService.getTournament(this._tournamentId);
			if (updatedTournament) {
				this._currentTournament = updatedTournament;
				this._setupTournamentDisplay(container); // Update display based on new tournament state
			}

			const currentMatches = await apiService.getMatches(this._tournamentId);
			console.log('matches', currentMatches);
			currentMatches.sort((a: Match, b: Match) => a.match_order - b.match_order); // Sort matches by order

			// Determine the last round number and filter matches for the last round
			const lastRoundNumber = Math.max(...currentMatches.map((match: Match) => match.round_number));
			const lastRoundMatches = currentMatches.filter(
				(match: Match) => match.round_number === lastRoundNumber,
			);

			if (JSON.stringify(lastRoundMatches) !== JSON.stringify(this._currentMatches)) {
				this._currentMatches = lastRoundMatches;
				this._setupMatchDisplay(container, lastRoundMatches); // Update display based on new matches
			}
		}, 1000);

		// Add WebSocket message event listener for tournament end notification
		this.root.ws?.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'tournament_message' && data.payload.action === 'tournament_end') {
				console.log('Tournament has ended. Winner:', data.payload.data.winner_username);
				this._winner = data.payload.data.winner_username;
				//TODO load winner scene
			}
		});
	}

	public onUpdate() {}

	public onFinish() {
		if (this._checkInterval) {
			clearInterval(this._checkInterval);
		}
		this.root.stopLoadingSound();
		console.log('finish');
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Escape') {
			try {
				//TODO add a confirmation dialog
				apiService.leaveTournament(this._tournamentId, this.root.userId!);
				this.root.loadScene(new SceneMenu2(this.root));
			} catch (error) {
				console.error('Error leaving tournament:', error);
			}
		}

		if (e.code === 'Enter') {
			const userMatches = this._currentMatches.filter(
				(match) => match.player1 === this.root.userId || match.player2 === this.root.userId,
			);
			if (userMatches.length > 0) {
				this._playMatch(userMatches[0]);
			}
		}
	}

	public onKeyUp() {}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initTextStandings(text: PIXI.Text) {
		text.style.fill = defaultColor;
		text.filters = [glowFilter];
		text.style.fontSize = (this.root.width * 7) / 100;
		text.y = (this.root.height * 5) / 100;
		text.x = (this.root.width * 50) / 100 - text.width / 2;

		return text;
	}

	private _initLineTournament4(container: PIXI.Container) {
		const size = this.root.width / 2 / 2;
		const pourcentage = 30;
		const newWidth = (this.root.width * pourcentage) / 100;
		const ratio = this._sprite.width / this._sprite.height;
		const newHigth = newWidth / ratio;

		for (let i = 0; i < 2; i++) {
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
		this._sprites[1].x = size * 3 - this._sprites[0].width / 2;

		for (let i = 0; i < 2; i++) {
			containerSprite.addChild(this._sprites[i]);
		}
		container.addChild(this._sprite, containerSprite);
		return container;
	}

	private _initLineTournament8(container: PIXI.Container) {
		const size = this.root.width / 4;
		const pourcentage = 25;
		const newWidth = (this.root.width * pourcentage) / 100;
		const ratio = this._sprite.width / this._sprite.height;
		const newHigth = newWidth / ratio;

		for (let i = 0; i < 6; i++) {
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
		this._sprites[0].x = size - this._sprites[0].width / 2;

		this._sprites[1].width = newWidth;
		this._sprites[1].height = newHigth;
		this._sprites[1].y = this._sprite.y + this._sprite.height;
		this._sprites[1].x = size * 3 - this._sprites[1].width / 2;

		for (let i = 0; i < 2; i++) {
			containerSprite.addChild(this._sprites[i]);
		}

		const containerSprite4 = new PIXI.Container();

		this._sprites[2].width = newWidth;
		this._sprites[2].height = newHigth;
		this._sprites[2].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[2].x = size - size / 2 - this._sprites[2].width / 2;

		this._sprites[3].width = newWidth;
		this._sprites[3].height = newHigth;
		this._sprites[3].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[3].x = size * 2 - size / 2 - this._sprites[3].width / 2;

		this._sprites[4].width = newWidth;
		this._sprites[4].height = newHigth;
		this._sprites[4].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[4].x = size * 3 - size / 2 - this._sprites[4].width / 2;

		this._sprites[5].width = newWidth;
		this._sprites[5].height = newHigth;
		this._sprites[5].y = this._sprite.y + this._sprite.height * 2;
		this._sprites[5].x = size * 4 - size / 2 - this._sprites[5].width / 2;

		for (let i = 2; i < 6; i++) {
			containerSprite4.addChild(this._sprites[i]);
		}
		container.addChild(this._sprite, containerSprite, containerSprite4);
		return container;
	}

	private _initNameVs4(names: PIXI.Container) {
		const playerNames = this._currentTournament?.participants_usernames;
		console.log(playerNames);
		if (playerNames && playerNames.length) {
			for (let i = 0; i < playerNames.length; i++) {
				const newName = new PIXI.Text(playerNames[i], {
					fontSize: (this.root.width * 3) / 100,
					fill: defaultColor,
				});
				newName.filters = [glowFilter];
				newName.angle = 90;
				newName.y = (this.root.height * 65) / 100;
				newName.x = (this.root.width * 17) / 100 + i * ((this.root.width * 20) / 100);

				if (i >= 2) {
					newName.x = (this.root.width * 28) / 100 + i * ((this.root.width * 20) / 100);
				}
				this._nameVs.push(newName); // Add the new text element to the _nameVs array
			}
		}
		for (let i = 0; i < this._nameVs.length; i++) {
			names.addChild(this._nameVs[i]);
		}
		return names;
	}

	// private _initNameVs8(names: PIXI.Container) {
	// 	const playerNames = this._currentTournament?.participants_usernames;
	// 	console.log(this._currentTournament);

	// 	if (playerNames) {
	// 		for (let i = 0; i < playerNames.length; i++) {
	// 			while (i < 8) {
	// 				console.log(playerNames[i]);
	// 				const newName = new PIXI.Text(playerNames[i]);
	// 				const adjustment = (this.root.height * 70 * 0.03) / 100;
	// 				newName.style.fontSize = (this.root.width * 2) / 100;
	// 				newName.y = (this.root.height * 70) / 100 + (i % 2 === 1 ? adjustment : 0);
	// 				newName.x = (this.root.width * 2) / 100 + i * ((this.root.width * 12.2) / 100);
	// 				newName.style.fill = defaultColor;
	// 				newName.filters = [glowFilter];
	// 				this._nameVs[i] = newName;
	// 				i++;
	// 			}
	// 		}
	// 	}
	// 	for (let i = 0; i < this._nameVs.length; i++) {
	// 		names.addChild(this._nameVs[i]);
	// 	}
	// 	return names;

	// }

	//=======================================
	// UTILS
	//=======================================

	private _setupTournamentDisplay(container: PIXI.Container) {
		// Clear existing sprites and names to prepare for update
		this._containerSprite.removeChildren();
		this._containerNames.removeChildren();
		this._nameVs = [];

		// Setup tournament lines based on the number of participants
		if (this._currentTournament?.max_participants === 4) {
			this._initLineTournament4(this._containerSprite);
		} else if (this._currentTournament?.max_participants === 8) {
			this._initLineTournament8(this._containerSprite);
		}
		container.addChild(this._containerSprite);

		// Setup player names
		if (this._currentTournament!.participants_usernames.length > 0) {
			if (this._currentTournament!.max_participants === 4) {
				this._initNameVs4(this._containerNames);
			}
			container.addChild(this._containerNames);
		}
	}

	private _setupMatchDisplay(container: PIXI.Container, matches: Match[]) {
		this._containerMatches.removeChildren();

		// Determine the last round number
		const lastRoundNumber = Math.max(...matches.map((match) => match.round_number));

		// Filter matches to only include those from the last round
		const lastRoundMatches = matches.filter((match) => match.round_number === lastRoundNumber);

		lastRoundMatches.forEach((match) => {
			const matchDisplay = this.createMatchDisplayElement(match);
			this._containerMatches.addChild(matchDisplay);
		});

		container.addChild(this._containerMatches);
	}

	private _playMatch(match: Match) {
		console.log('test');
		if ([match.player1, match.player2].includes(this.root.userId ?? 0)) {
			console.log('test2222');
			this.root.loadScene(new SceneLoadingPage(this.root, match.game));
		}
	}

	private _initEnterText(container: PIXI.Container) {
		const text = new PIXI.Text('Press ENTER to join', {
			fontSize: (this.root.width * 4) / 100,
			fill: defaultColor,
		});
		text.filters = [glowFilter];
		text.x = (this.root.width * 60) / 100;
		text.y = (this.root.height * 95) / 100;
		container.addChild(text);
	}

	private createMatchDisplayElement(match: Match): PIXI.Text {
		const text = new PIXI.Text(
			`Match ${match.match_order}: ${match.player1_username} vs ${match.player2_username}`,
			{
				fontSize: (this.root.width * 4) / 100,
				fill: defaultColor,
			},
		);
		text.filters = [glowFilter];
		// Set position based on match order or any other logic
		text.x = (this.root.width * 10) / 100;
		text.y = (this.root.height * 80) / 100 + match.match_order * 20;
		return text;
	}
}
