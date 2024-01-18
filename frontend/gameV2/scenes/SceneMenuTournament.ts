import * as PIXI from 'pixi.js';
import { SceneBase } from './SceneBase';
import apiService from '../../src/services/apiService';
import { glowFilter, defaultColor, textStyleMenuTournamentCreate, textStyleMenuTournamentName, textStyleMenuTournamentMaxScore, textStyleMenuTournamentMode, textStyleMenuTournamentPlayer, textStyleMenuOptionPlay, textStyleTournamentMenu } from '..';

const apiTournament = await apiService.getTournaments();

console.log(apiTournament);

const selectMaxCreate = 3;

enum menuState {
	SELECT_MENU,
	CREATE_MENU,
	JOIN_MENU,
}

// FOR THE BACK ===============================

let nb_playerForBack = 0;
let nb_scoreForBack = 0;
// ====================================================

export class SceneMenuTournament extends SceneBase {


	private state: menuState = menuState.SELECT_MENU;
	private _currentSelectCreate = -1;

	// MENU CREATE ==========================================
	private _create = new PIXI.Container();
	private _textCreate = new PIXI.Text('CREATE', textStyleMenuTournamentCreate);
	private _name = new PIXI.Text('NAME:', textStyleMenuTournamentName);
	private _nameInputBox = new PIXI.Graphics();


	private _nb_player_text = new PIXI.Text('PLAYER: ', textStyleMenuTournamentPlayer);

	private _score_max_text = new PIXI.Text('MAX SCORE:', textStyleMenuTournamentMaxScore);
	private _mode = new PIXI.Text('MODE:', textStyleMenuTournamentMode);
	private _nb_player_tab = new PIXI.Text('< 4 >', textStyleMenuTournamentPlayer);
	private _nbPlayer: number[] = [4, 6, 8];

	private _score_max_tab = new PIXI.Text('< 3 >', textStyleMenuTournamentMaxScore);
	private _scoreMax: number[] = [3, 5, 10];

	private _currentNbPlayer = 0;
	private _currentMaxScore = 0;

	private _textJoin = new PIXI.Text('JOIN');
	// private _GameNameText;
	// private _modeText;
	// private _mode = { singleElim: 'SINGLE ELIMINATON', roundRobin: 'ROUND ROBIN' };
	private _confirm;
	private _textPlay = new PIXI.Text('PLAY', textStyleMenuOptionPlay);

	private _join = new PIXI.Container();
	// private _

	// private _selectCreate = true;

	private _inputText = '';
	private _textInputField = new PIXI.Text(this._inputText, { fill: defaultColor, fontSize: 20, });

	//=======================================
	// Effects
	//=======================================

	//=======================================
	// HOOK
	//=======================================

	public onStart(container: PIXI.Container) {
		container.addChild(this._initTextCreate(this._textCreate));
		container.addChild(this._initTextJoin(this._textJoin));
		this._create = this._initMenuCreate();
		container.addChild(this._create);
		this._join = this._initMenuJoin();
		container.addChild(this._join);

		// this._create = this._initMenuCreate();
		// container.addChild(this._create);
	}

	public onUpdate() {}

	public onFinish() {}

	public onKeyDown(e: KeyboardEvent) {

		switch (this.state) {
			case menuState.SELECT_MENU:
				if (e.code === 'ArrowLeft') {
					this._create.visible = true;
					this._join.visible = false;
					this._textCreate.style.fill = defaultColor;
					this._textJoin.style.fill = 'green';
				}
				if (e.code === 'ArrowRight') {
					this._create.visible = false;
					this._join.visible = true;
					this._textJoin.style.fill = defaultColor;
					this._textCreate.style.fill = 'green';
				}
				if (e.code === 'ArrowUp' && this._currentSelectCreate === -1) {

					if (this._create.visible === true) {
						this._currentSelectCreate = selectMaxCreate;
						this._textPlayColorCreate();
						this.state = menuState.CREATE_MENU;
					} else this.state = menuState.JOIN_MENU;
				}
				if (e.code === 'ArrowDown' && this._currentSelectCreate === -1) {
					if (this._create.visible === true) {
						this._currentSelectCreate = 0;
						this._nameColorCreate();
						this.state = menuState.CREATE_MENU;
					} else this.state = menuState.JOIN_MENU;
				}
				break;
			case menuState.CREATE_MENU:

				if (e.code === 'ArrowUp') {

					this._currentSelectCreate--;
					if (this._currentSelectCreate < -1) {
						this._currentSelectCreate = selectMaxCreate;
					}
					this._pressUp();
				}

				if (e.code === 'ArrowDown') {

					this._currentSelectCreate++;
					if (this._currentSelectCreate > selectMaxCreate) {
						this._currentSelectCreate = -1;
					}
					this._pressDown();
				}

				if (e.code === 'ArrowLeft') {
					this._pressLeft();
				}

				if (e.code === 'ArrowRight') {
					this._pressRight();
				}

				if (e.code === 'Enter') {

				}

				if (this._currentSelectCreate === 0) {
					if (e.key === 'Backspace') {
						this._inputText = this._inputText.slice(0, -1);
					} else if (e.key.length === 1 && this._inputText.length < 10) {
						this._inputText += e.key;
					}
					if (this._inputText.length > 10)
						return;
					this._textInputField.text = this._inputText;
				}
				break;
			case menuState.JOIN_MENU:
				// if (e.code === 'ArrowUp') {

				// }
				// if (e.code === 'ArrowDown') {

				// }
				// if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {

				// }
				break;
		}
	}

	public onKeyUp() {}


	private _pressUp() {

		if (this._currentSelectCreate === -1) {
			this._name.style.fill = 'green';
			this.state = menuState.SELECT_MENU;
		} 
		if (this._currentSelectCreate === 0) return this._nameCreate();
		// if (this._currentSelectCreate === 1) return this._modeCreate();
		if (this._currentSelectCreate === 1) return this._playerCreate();
		if (this._currentSelectCreate === 2) return this._maxScoreCreate();
		if (this._currentSelectCreate === 3) return this._textPlayCreate();
	}

	private _pressDown() {

		if (this._currentSelectCreate === -1) {
			this._textPlay.style.fill = 'green';
			this.state = menuState.SELECT_MENU;
		}
		if (this._currentSelectCreate === 0) return this._nameCreate();
		// if (this._currentSelectCreate === 1) return this._modeCreate();
		if (this._currentSelectCreate === 1) return this._playerCreate();
		if (this._currentSelectCreate === 2) return this._maxScoreCreate();
		if (this._currentSelectCreate === 3) return this._textPlayCreate();
	}

	private _pressLeft() {
		if (this._currentSelectCreate === 1) return this._playerPrev();
		if (this._currentSelectCreate === 2) return this._maxScorePrev();
	}

	private _pressRight() {
		if (this._currentSelectCreate === 1) return this._playerNext();
		if (this._currentSelectCreate === 2) return this._maxScoreNext();
	}

	private _initTextCreate(text: PIXI.Text) {
		text.x = (this.root.width * 10) / 100;
		text.y = (this.root.height * 5) / 100;
		text.style.fontSize = (this.root.width * 5) / 100;
		text.style.fill = defaultColor;
		text.filters = [glowFilter];
		return text;
	}

	private _initTextJoin(text: PIXI.Text) {
		text.x = (this.root.width * 90) / 100 - text.width;
		text.y = (this.root.height * 5) / 100;
		text.style.fontSize = (this.root.width * 5) / 100;
		text.style.fill = 'green';
		text.filters = [glowFilter];
		return text;
	}



	private _initMenuCreate(): PIXI.Container {
		const menu = new PIXI.Container();


		this._name.style.fill = 'green';
		this._name.x = this.root.width / 5;
		this._name.y = (this.root.height * 30) / 100 - this._name.height / 2;
		// this._name.style.fontSize = 10;
		this._name.filters = [glowFilter];
		menu.addChild(this._name);

		this._nameInputBox.lineStyle(1, 'green', 1);
		this._nameInputBox.drawRect(0, 0, (this.root.width * 30) / 100, 15);
		this._nameInputBox.visible = true;
		this._nameInputBox.x = this.root.width - this._nameInputBox.width - this.root.width / 5;
		this._nameInputBox.y = this._name.y;
		this._nameInputBox.endFill();
		this._nameInputBox.filters = [glowFilter];
		menu.addChild(this._nameInputBox);

		this._textInputField.x = this.root.width - this._nameInputBox.width - this.root.width / 5;
		this._textInputField.y = this._name.y  - (this._nameInputBox.height / 2 - this._textInputField.height / 2);
		this._textInputField.filters = [glowFilter];
		menu.addChild(this._textInputField);

		// this._mode.style.fill = 'green';
		// this._mode.x = this.root.width / 5;
		// this._mode.y = (this.root.height * 17) / 100 + this._name.y - this._mode.height / 2;
		// this._mode.style.fontSize = 10;
		// this._mode.filters = [glowFilter];
		// menu.addChild(this._mode);

		this._nb_player_text.style.fill = 'green';
		this._nb_player_text.x = this.root.width / 5;
		this._nb_player_text.y = (this.root.height * 17) / 100 + this._nameInputBox.y - this._nb_player_text.height / 2;
		// this._nb_player_text.style.fontSize = 10;
		this._nb_player_text.filters = [glowFilter];
		menu.addChild(this._nb_player_text);

		this._nb_player_tab.style.fill = 'green';
		this._nb_player_tab.x = this.root.width - 100;
		this._nb_player_tab.y = this._nb_player_text.y;
		// this._nb_player_tab.style.fontSize = 10;
		this._nb_player_tab.filters = [glowFilter];
		menu.addChild(this._nb_player_tab);
	

		this._score_max_text.style.fill = 'green';
		this._score_max_text.x = this.root.width / 5;
		this._score_max_text.y = (this.root.height * 17) / 100 + this._nb_player_text.y - this._score_max_text.height / 2;
		// this._score_max_text.style.fontSize = 10;
		this._score_max_text.filters = [glowFilter];
		menu.addChild(this._score_max_text);

		this._score_max_tab.style.fill = 'green';
		this._score_max_tab.x = this.root.width -  100;
		this._score_max_tab.y = this._score_max_text.y;
		// this._score_max_tab.style.fontSize = 10;
		this._score_max_tab.filters = [glowFilter];
		menu.addChild(this._score_max_tab);

		this._textPlay.style.fill = 'green';
		this._textPlay.x = this.root.width / 2 - this._textPlay.width / 2; 
		this._textPlay.y = this.root.height - 100;
		this._textPlay.filters = [glowFilter];
		menu.addChild(this._textPlay);

		menu.visible = true;

		return menu;
	}

	private _initMenuJoin(): PIXI.Container {
		const menu = new PIXI.Container();
		const menuBox = new PIXI.Graphics();

		menuBox.beginFill('blue');
		menuBox.drawRect(0, 0, this.root.width - 20, 100);
		menuBox.visible = true;
		menuBox.x = this.root.width / 2 - menuBox.width / 2;
		menuBox.y = this.root.height / 2 - menuBox.height / 2;
		menuBox.endFill();
		menu.addChild(menuBox);

		menu.visible = false;

		return menu;
	}

	private _nameCreate() {
		this._nameColorCreate();
	}

	private _modeCreate(){
		this._modeColorCreate();
	}

	private _playerCreate(){
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

	private _modeColorCreate() {
		this._name.style.fill = 'green';
		this._mode.style.fill = defaultColor;
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

	private _textPlayColorCreate(){
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
			this._currentNbPlayer = 2;
		}
		this._nb_player_tab.text = '< ' + this._nbPlayer[this._currentNbPlayer] + ' >'; 

		nb_playerForBack = this._nbPlayer[this._currentNbPlayer];

	}

	private _playerNext() {
		this._currentNbPlayer++;
		if (this._currentNbPlayer > 2) {
			this._currentNbPlayer = 0;
		}
		this._nb_player_tab.text = '< ' + this._nbPlayer[this._currentNbPlayer] + ' >';
		
		nb_playerForBack = this._nbPlayer[this._currentNbPlayer];
	}

	private _maxScorePrev() {
		this._currentMaxScore--;
		if (this._currentMaxScore < 0) {
			this._currentMaxScore = 2;
		}
		this._score_max_tab.text = '< ' + this._scoreMax[this._currentMaxScore] + ' >';

		nb_scoreForBack = this._scoreMax[this._currentMaxScore];
	}

	private _maxScoreNext() {
		this._currentMaxScore++;
		if (this._currentMaxScore > 2) {
			this._currentMaxScore = 0;
		}
		this._score_max_tab.text = '< ' + this._scoreMax[this._currentMaxScore] + ' >';

		nb_scoreForBack = this._scoreMax[this._currentMaxScore];
	}

}
