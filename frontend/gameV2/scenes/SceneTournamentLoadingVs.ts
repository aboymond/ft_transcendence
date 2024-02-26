import { defaultColor } from '..';
import { SceneBase } from './SceneBase';
import * as PIXI from 'pixi.js';
import { PixiManager } from '../PixiManager';
import apiService from '../../src/services/apiService';
import { Tournament } from '../../src/types';
import { Match } from '../../src/types';
import { SceneLoadingPage } from './SceneLoadingPage';
import { AudioManager } from '../AudioManager';
import { Tools } from '../Tools';
import { SceneTournamentWinner } from './SceneTournamentWinner';
import { SceneMenu } from './SceneMenu';

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

	//Exit menu
	private _exitMenu = new PIXI.Container();
	private _yesOption!: PIXI.Text;
	private _noOption!: PIXI.Text;
	private _exitText!: PIXI.Text;

	private _exitBool = false;
	private _exitYesNO = true;
	// private _keysPressed: { [key: string]: boolean } = {};
	private _escapeKeyPressed = false;

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
		this._exitMenu = this._initExitMenu();
		container.addChild(this._exitMenu);

		AudioManager.play('loading');

		// Fetch the current tournament state
		try {
			const currentTournament = await apiService.getTournament(this._tournamentId);
			if (currentTournament) {
				this._currentTournament = currentTournament;
				container.addChild(this._setupTournamentDisplay(this._containerSprite)); // Setup initial display based on current tournament state
			}
		} catch (error) {
			console.error('Error fetching tournament:', error);
			this.root.loadScene(new SceneMenu(this.root));
		}

		this._checkInterval = window.setInterval(async () => {
			try {
				const updatedTournament = await apiService.getTournament(this._tournamentId);
				if (updatedTournament) {
					this._currentTournament = updatedTournament;
					this._setupTournamentDisplay(container); // Update display based on new tournament state
				}

				const currentMatches = await apiService.getMatches(this._tournamentId);
				currentMatches.sort((a: Match, b: Match) => a.match_order - b.match_order); // Sort matches by order

				// Determine the last round number and filter matches for the last round
				const lastRoundNumber = Math.max(...currentMatches.map((match: Match) => match.round_number));
				const lastRoundMatches = currentMatches.filter(
					(match: Match) => match.round_number === lastRoundNumber && match.game_status !== 'completed',
				);

				if (JSON.stringify(lastRoundMatches) !== JSON.stringify(this._currentMatches)) {
					this._currentMatches = lastRoundMatches;
					this._setupMatchDisplay(container, lastRoundMatches); // Update display based on new matches
				}
			} catch (error) {
				console.error('Error fetching matches or tournament:', error);
				this.root.loadScene(new SceneMenu(this.root));
			}
		}, 10000);

		this.root.ws?.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'tournament_message' && data.payload.action === 'tournament_end') {
				this._winner = data.payload.data.winner_display_name;
				this.root.loadScene(new SceneTournamentWinner(this.root, this._winner));
			}
			if (data.type === 'tournament_message' && data.payload.action == 'tournament_update') {
				this._currentTournament = data.payload.tournament;
				this._currentMatches = data.payload.matches;
				this._setupTournamentDisplay(container);
				this._setupMatchDisplay(container, this._currentMatches);
			}
		});
	}

	public onUpdate() {}

	public onFinish() {
		if (this._checkInterval) {
			clearInterval(this._checkInterval);
		}
		AudioManager.pause('loading');
		AudioManager.reset();
	}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Escape' && !this._escapeKeyPressed) {
			this._escapeKeyPressed = true;
			this._exitBool = !this._exitBool;
			this._exitMenu.visible = this._exitBool;
		}

		if (e.code === 'Enter') {
			if (this._exitBool) {
				if (this._exitYesNO) {
					apiService
						.leaveTournament(this._tournamentId, this.root.userId!)
						.then(() => this.root.loadScene(new SceneMenu(this.root)));
				} else {
					this._exitBool = false;
					this._exitMenu.visible = false;
				}
			} else {
				const userMatches = this._currentMatches.filter(
					(match) => match.player1 === this.root.userId || match.player2 === this.root.userId,
				);
				if (userMatches.length > 0) {
					this._playMatch(userMatches[0]);
				}
			}
		}

		if (e.code === 'ArrowRight') {
			this._exitYesNO = false;
			this._noOption.style.fill = defaultColor;
			this._yesOption.style.fill = 0x053100;
		}
		if (e.code === 'ArrowLeft') {
			this._exitYesNO = true;
			this._yesOption.style.fill = defaultColor;
			this._noOption.style.fill = 0x053100;
		}
	}
	public onKeyUp(e: KeyboardEvent) {
		if (e.code === 'Escape') {
			this._escapeKeyPressed = false;
		}
	}

	//=======================================
	// UTILS INIT
	//=======================================

	private _initTextStandings(text: PIXI.Text) {
		text.style.fill = defaultColor;
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

	private _initNameVs4(names: PIXI.Container) {
		if (this._currentMatches.length > 0 && this._currentMatches[0].round_number === 2) {
			const player1 = new PIXI.Text(this._currentMatches[0].player1_display_name, {
				fontSize: (this.root.width * 3) / 100,
				fill: defaultColor,
			});
			player1.angle = 90;
			player1.y = (this.root.height * 43) / 100;
			player1.x = (this.root.width * 44) / 100;
			this._nameVs.push(player1);
			const player2 = new PIXI.Text(this._currentMatches[0].player2_display_name, {
				fontSize: (this.root.width * 3) / 100,
				fill: defaultColor,
			});
			player2.angle = 90;
			player2.y = (this.root.height * 43) / 100;
			player2.x = (this.root.width * 62) / 100;
			this._nameVs.push(player2);
		}
		const playerNames = this._currentTournament?.participants_display_name;
		if (playerNames && playerNames.length) {
			for (let i = 0; i < playerNames.length; i++) {
				const newName = new PIXI.Text(playerNames[i], {
					fontSize: (this.root.width * 3) / 100,
					fill: defaultColor,
				});
				newName.angle = 90;
				newName.y = (this.root.height * 65) / 100;
				newName.x = (this.root.width * 17) / 100 + i * ((this.root.width * 20) / 100);

				if (i >= 2) {
					newName.x = (this.root.width * 28) / 100 + i * ((this.root.width * 20) / 100);
				}
				this._nameVs.push(newName);
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

	private _setupTournamentDisplay(container: PIXI.Container) {
		// Clear existing sprites and names to prepare for update
		this._containerSprite.removeChildren();
		this._containerNames.removeChildren();
		this._nameVs = [];

		// Setup tournament lines based on the number of participants
		if (this._currentTournament?.max_participants === 4) {
			this._initLineTournament4(this._containerSprite);
		}
		container.addChild(this._containerSprite);

		// Setup player names
		if (this._currentTournament!.participants_display_name.length > 0) {
			if (this._currentTournament!.max_participants === 4) {
				this._initNameVs4(this._containerNames);
			}
			container.addChild(this._containerNames);
		}
		return container;
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

		container.zIndex = -1;

		container.addChild(this._containerMatches);
	}

	private _playMatch(match: Match) {
		if ([match.player1, match.player2].includes(this.root.userId ?? 0)) {
			this.root.loadScene(new SceneLoadingPage(this.root, match.game));
		}
	}

	private _initEnterText(container: PIXI.Container) {
		const text = new PIXI.Text('Press ENTER to join', {
			fontSize: (this.root.width * 4) / 100,
			fill: defaultColor,
		});
		text.x = (this.root.width * 60) / 100;
		text.y = (this.root.height * 95) / 100;
		container.addChild(text);
	}

	private createMatchDisplayElement(match: Match): PIXI.Text {
		const text = new PIXI.Text(
			`Match ${match.match_order}: ${match.player1_display_name} vs ${match.player2_display_name} : ${match.game_status}`,
			{
				fontSize: (this.root.width * 4) / 100,
				fill: defaultColor,
			},
		);
		// Set position based on match order or any other logic
		text.x = (this.root.width * 10) / 100;
		text.y = (this.root.height * 80) / 100 + match.match_order * 20;
		return text;
	}

	private _initExitMenu(): PIXI.Container {
		const menu = new PIXI.Container();

		let background = new PIXI.Graphics();
		background.beginFill('green');
		background.drawRect(-280, -150, 280, 150);
		background = Tools.resizeGraphics(background, this.root.width, 50);
		background.endFill();
		background.visible = true;
		background.x = this.root.width / 2 + background.width / 2;
		background.y = (this.root.height * 95) / 100;
		menu.addChild(background);

		this._exitText = new PIXI.Text('Exit ?', { fill: defaultColor });
		this._exitText = Tools.resizeText(this._exitText, this.root.width, 40);
		this._exitText.x = background.x - background.width / 2 - this._exitText.width / 2;
		this._exitText.y = background.y - (background.height * 80) / 100;
		menu.addChild(this._exitText);

		this._yesOption = new PIXI.Text('Yes', { fill: defaultColor });
		this._yesOption = Tools.resizeText(this._yesOption, this.root.width, 35);
		this._yesOption.x = background.x - (background.width * 80) / 100 - this._yesOption.width / 2;
		this._yesOption.y = background.y - (background.height * 35) / 100;
		menu.addChild(this._yesOption);

		this._noOption = new PIXI.Text('No', { fill: 0x053100 });
		this._noOption = Tools.resizeText(this._noOption, this.root.width, 35);
		this._noOption.x = background.x - (background.width * 20) / 100 - this._noOption.width / 2;
		this._noOption.y = background.y - (background.height * 35) / 100;
		menu.addChild(this._noOption);

		menu.visible = false;

		menu.zIndex = 10;

		return menu;
	}
}
