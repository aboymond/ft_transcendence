import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import {
	defaultColor,
	textStyleMenuTournamentCreate,
	textStyleMenuTournamentName,
	textStyleMenuTournamentMaxScore,
	textStyleMenuTournamentMode,
	textStyleMenuTournamentPlayer,
	textStyleMenuOptionPlay,
} from '..';
import { SceneMenu2 } from './SceneMenu2';
import { SceneTournamentLoadingVs } from './SceneTournamentLoadingVs';
import { apiService } from '../../src/services/apiService';
import {AudioManager} from '../AudioManager';
import { Tools } from '../Tools';


const selectMaxCreate = 3;

enum menu {
	NAME = 0,
	PLAYER = 1,
	MAXSCORE = 2,
	PLAY = 3,
}

export class SceneMenuTournament extends SceneBase {
	// FOR THE BACK ================
	private _nb_playerForBack: number = 4;
	private _nb_scoreForBack: number = 3;
	// ====================================================

	// private state: menuState = menuState.SELECT_MENU;
	private _currentSelectCreate = -1;

	// MENU CREATE ==========================================
	private _create = new PIXI.Container();
	private _textCreate = new PIXI.Text('CREATE', textStyleMenuTournamentCreate);
	private _name = new PIXI.Text('NAME:', textStyleMenuTournamentName);
	private _nameInputBox = new PIXI.Graphics();

	private _nb_player_text = new PIXI.Text('PLAYER:', textStyleMenuTournamentPlayer);

	private _score_max_text = new PIXI.Text('MAX SCORE:', textStyleMenuTournamentMaxScore);
	private _mode = new PIXI.Text('MODE:', textStyleMenuTournamentMode);
	private _nb_player_tab = new PIXI.Text('< 4 >', textStyleMenuTournamentPlayer);
	private _nbPlayer: number = 4;

	private _score_max_tab = new PIXI.Text('< 3 >', textStyleMenuTournamentMaxScore);
	private _scoreMax: number[] = [3, 5, 10];

	private _currentNbPlayer = 0;
	private _currentMaxScore = 0;

	private _textPlay = new PIXI.Text('PLAY', textStyleMenuOptionPlay);

	private _inputText = '';
	private _textInputField = new PIXI.Text(this._inputText, { fill: defaultColor, fontSize: 20 });

	//=======================================
	// Effects
	//=======================================

	//=======================================
	// HOOK
	//=======================================

	public async onStart(container: PIXI.Container) {
		container.addChild(this._initTextCreate(this._textCreate));
		this._create = this._initMenuCreate();
		container.addChild(this._create);
	}

	public onUpdate() {}

	public onFinish() {}

	public onKeyDown(e: KeyboardEvent) {
		if (e.code === 'ArrowUp') {
			AudioManager.play('select');

			this._currentSelectCreate--;
			if (this._currentSelectCreate < menu.NAME) {
				this._currentSelectCreate = selectMaxCreate;
			}
			this._pressUp();
		}

		if (e.code === 'ArrowDown') {
			AudioManager.play('select');

			this._currentSelectCreate++;
			if (this._currentSelectCreate > selectMaxCreate) {
				this._currentSelectCreate = menu.NAME;
			}
			this._pressDown();
		}

		if (e.code === 'ArrowLeft') {
			AudioManager.play('select');

			this._pressLeft();
		}

		if (e.code === 'ArrowRight') {
			AudioManager.play('select');
			this._pressRight();
		}
		if (e.code === 'Enter') {
			if (this._currentSelectCreate === menu.PLAY) {
				AudioManager.play('enter');	
				this._inputText = this._inputText.trim();
				if (this._inputText === '') alert('Please enter a name for the tournament');
				else this._createTournament();
			}
		}

		if (e.code === 'Escape') {
			this.root.loadScene(new SceneMenu2(this.root));
		}

		if (this._currentSelectCreate === menu.NAME) {
			if (e.key === 'Backspace') {
				this._inputText = this._inputText.slice(0, -1);
			} else if (e.key.length === 1 && this._inputText.length < 10) {
				this._inputText += e.key;
			}
			if (this._inputText.length > 15) return;
			this._textInputField.text = this._inputText;
			console.log('text: ' + this._textInputField.text + ' length: ' + this._inputText.length);
		}
	}

	public onKeyUp() {}

	private _pressUp() {
		if (this._currentSelectCreate === menu.NAME) return this._nameCreate();
		if (this._currentSelectCreate === menu.PLAYER) return this._playerCreate();
		if (this._currentSelectCreate === menu.MAXSCORE) return this._maxScoreCreate();
		if (this._currentSelectCreate === menu.PLAY) return this._textPlayCreate();
	}

	private _pressDown() {
		if (this._currentSelectCreate === menu.NAME) return this._nameCreate();
		if (this._currentSelectCreate === menu.PLAYER) return this._playerCreate();
		if (this._currentSelectCreate === menu.MAXSCORE) return this._maxScoreCreate();
		if (this._currentSelectCreate === menu.PLAY) return this._textPlayCreate();
	}

	private _pressLeft() {
		if (this._currentSelectCreate === menu.PLAYER) return this._playerPrev();
		if (this._currentSelectCreate === menu.MAXSCORE) return this._maxScorePrev();
	}

	private _pressRight() {
		if (this._currentSelectCreate === menu.PLAYER) return this._playerNext();
		if (this._currentSelectCreate === menu.MAXSCORE) return this._maxScoreNext();
	}

	private _initTextCreate(text: PIXI.Text) {
		text.x = (this.root.width * 10) / 100;
		text.y = (this.root.height * 5) / 100;
		text = Tools.resizeText(text, this.root.width, 45);
		text.style.fill = defaultColor;
		return text;
	}

	private _initMenuCreate(): PIXI.Container {
		const menu = new PIXI.Container();
		const pourcent = 40;
		const alignLeft = (this.root.width * 10) / 100;
		const alignRight = (this.root.width * 70) / 100;

		this._name = Tools.resizeText(this._name, this.root.width , pourcent);
		this._name.style.fill = 'green';
		this._name.x = alignLeft;
		this._name.y = (this.root.height * 30) / 100 - (this._name.height / 2);
		menu.addChild(this._name);

		this._nameInputBox.lineStyle(1, 'green', 1);
		this._nameInputBox.drawRect(0, 0, (this.root.width * 45) / 100, (this.root.height * 10) / 100);
		this._nameInputBox = Tools.resizeGraphics(this._nameInputBox, this.root.width, 30);
		this._nameInputBox.visible = true;
		this._nameInputBox.x = alignRight - (this._nameInputBox.width / 2);
		this._nameInputBox.y = this._name.y;
		this._nameInputBox.endFill();
		menu.addChild(this._nameInputBox);

		this._textInputField = Tools.resizeText(this._textInputField, this.root.width, pourcent);
		this._textInputField.x = this._nameInputBox.x;
		this._textInputField.y = this._name.y;
		menu.addChild(this._textInputField);

		this._nb_player_text = Tools.resizeText(this._nb_player_text, this.root.width, pourcent);
		this._nb_player_text.style.fill = 'green';
		this._nb_player_text.x = (this.root.width * 10) / 100;
		this._nb_player_text.y =
			(this.root.height * 17) / 100 + this._nameInputBox.y - this._nb_player_text.height / 2;
		menu.addChild(this._nb_player_text);

		this._nb_player_tab = Tools.resizeText(this._nb_player_tab, this.root.width, pourcent);
		this._nb_player_tab.style.fill = 'green';
		this._nb_player_tab.x = alignRight - (this._nb_player_tab.width / 2);
		this._nb_player_tab.y = this._nb_player_text.y;
		menu.addChild(this._nb_player_tab);

		this._score_max_text = Tools.resizeText(this._score_max_text, this.root.width, pourcent);
		this._score_max_text.style.fill = 'green';
		this._score_max_text.x = alignLeft;
		this._score_max_text.y =
			(this.root.height * 17) / 100 + this._nb_player_text.y - this._score_max_text.height / 2;
		menu.addChild(this._score_max_text);

		this._score_max_tab = Tools.resizeText(this._score_max_tab, this.root.width, pourcent);
		this._score_max_tab.style.fill = 'green';
		this._score_max_tab.x = alignRight - (this._score_max_tab.width / 2);
		this._score_max_tab.y = this._score_max_text.y;
		menu.addChild(this._score_max_tab);

		this._textPlay.style.fill = 'green';
		this._textPlay.x = this.root.width / 2 - this._textPlay.width / 2;
		this._textPlay.y = ((this.root.height - this._textPlay.height / 2) * 85) / 100;
		menu.addChild(this._textPlay);

		menu.visible = true;

		return menu;
	}

	private _nameCreate() {
		this._nameColorCreate();
	}

	private _playerCreate() {
		this._playerColorCreate();
	}

	private _maxScoreCreate() {
		this._maxScoreColorCreate();
	}

	private _textPlayCreate() {
		this._textPlayColorCreate();
	}

	private _nameColorCreate() {
		this._name.style.fill = defaultColor;
		this._mode.style.fill = 'green';
		this._nb_player_text.style.fill = 'green';
		this._nb_player_tab.style.fill = 'green';
		this._score_max_text.style.fill = 'green';
		this._score_max_tab.style.fill = 'green';
		this._textPlay.style.fill = 'green';
	}

	private _playerColorCreate() {
		this._name.style.fill = 'green';
		this._mode.style.fill = 'green';
		this._nb_player_text.style.fill = defaultColor;
		this._nb_player_tab.style.fill = defaultColor;
		this._score_max_text.style.fill = 'green';
		this._score_max_tab.style.fill = 'green';
		this._textPlay.style.fill = 'green';
	}

	private _maxScoreColorCreate() {
		this._name.style.fill = 'green';
		this._mode.style.fill = 'green';
		this._nb_player_text.style.fill = 'green';
		this._nb_player_tab.style.fill = 'green';
		this._score_max_text.style.fill = defaultColor;
		this._score_max_tab.style.fill = defaultColor;
		this._textPlay.style.fill = 'green';
	}

	private _textPlayColorCreate() {
		this._name.style.fill = 'green';
		this._mode.style.fill = 'green';
		this._nb_player_text.style.fill = 'green';
		this._nb_player_tab.style.fill = 'green';
		this._score_max_text.style.fill = 'green';
		this._score_max_tab.style.fill = 'green';
		this._textPlay.style.fill = defaultColor;
	}

	private _playerPrev() {
		this._currentNbPlayer--;
		if (this._currentNbPlayer < 0) {
			this._currentNbPlayer = 1;
		}
		this._nb_player_tab.text = '< ' + this._nbPlayer + ' >';

		this._nb_playerForBack = this._nbPlayer;
	}

	private _playerNext() {
		this._currentNbPlayer++;
		if (this._currentNbPlayer > 1) {
			this._currentNbPlayer = 0;
		}
		this._nb_player_tab.text = '< ' + this._nbPlayer + ' >';

		this._nb_playerForBack = this._nbPlayer;
	}

	private _maxScorePrev() {
		this._currentMaxScore--;
		if (this._currentMaxScore < 0) {
			this._currentMaxScore = 2;
		}
		this._score_max_tab.text = '< ' + this._scoreMax[this._currentMaxScore] + ' >';

		this._nb_scoreForBack = this._scoreMax[this._currentMaxScore];
	}

	private _maxScoreNext() {
		this._currentMaxScore++;
		if (this._currentMaxScore > 2) {
			this._currentMaxScore = 0;
		}
		this._score_max_tab.text = '< ' + this._scoreMax[this._currentMaxScore] + ' >';

		this._nb_scoreForBack = this._scoreMax[this._currentMaxScore];
	}

	private _createTournament() {
		console.log('Create tournament');
		console.log('creator_id:', this.root.userId);
		console.log('name:', this._inputText);
		console.log('max_participants:', this._nb_playerForBack);
		console.log('max_score:', this._nb_scoreForBack);
		apiService
			.createTournament(this.root.userId ?? 0, this._inputText, this._nb_playerForBack, this._nb_scoreForBack)
			.then((response) => {
				console.log('Tournament created successfully', response);
				this.root.loadScene(new SceneTournamentLoadingVs(this.root, response.id));
			})
			.catch((error) => console.error('Error creating game', error));
	}
}
