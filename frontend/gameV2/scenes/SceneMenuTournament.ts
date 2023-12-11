import * as PIXI from 'pixi.js';
import { SceneBase } from "./SceneBase";
import { TextInput } from 'pixi-text-input';



// import { SceneMenuOption } from "./SceneMenuOption";
import { glowFilter, defaultColor, textStylePVPMenu2, textStylePVBMenu2, textStyleTournamentMenu} from "..";



const selectMaxCreate = 4;
enum menuState {
	SELECT_MENU,
	CREATE_MENU,
	JOIN_MENU
}

export class SceneMenuTournament extends SceneBase {

	private state: menuState = menuState.SELECT_MENU;
	private _currentSelectCreate = 0;
	private _currentSelectjoin = 0;

	private _menuBoxTournament = new PIXI.Graphics();
	private _menuBoxPvP = new PIXI.Graphics(); 
	private _menuBoxPvB = new PIXI.Graphics(); 
	private _textTournament = new PIXI.Text('TOURNAMENT', textStyleTournamentMenu);
	private _textPvP = new PIXI.Text('PLAYER\n  VS\n  PLAYER', textStylePVPMenu2);
	private _textPvB = new PIXI.Text('PLAYER\n  VS\n  BOT', textStylePVBMenu2);

	private _create = new PIXI.Container();
	private _textCreate = new PIXI.Text("CREATE");
	private _textJoin = new PIXI.Text("JOIN");
	private _GameNameText;
	private _modeText;
	private _mode = {singleElim: "SINGLE ELIMINATON", roundRobin: "ROUND ROBIN"};
	private _nbPlayer: number[] = [4, 6, 8];
	private _scoreMax;
	private _confirm;

	private _join = new PIXI.Container();
	// private _

	private _selectCreate = true;

	private _inputText = "";
	private _textInputField = new PIXI.Text(this._inputText, { fill: 'black', fontSize: 20 });



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

	public onUpdate() {

	}

	public onFinish() {
	}

	public onKeyDown(e: KeyboardEvent) {
		// if (this.state === menuState.CREATE_MENU) {
		// 	if (e.key === "Backspace") {
		// 		this._inputText = this._inputText.slice(0, -1);
		// 	}
		// 	else if (e.key.length === 1) {
		// 		this._inputText += e.key;
		// 	}
		// 	this._textInputField.text = this._inputText;
		// }
		console.log("text input = " + this._textInputField.text)
		switch (this.state) {
			case menuState.SELECT_MENU:
					if (e.code === 'ArrowLeft') {
							this._create.visible = true;
							this._join.visible = false;
					}
					if (e.code === 'ArrowRight') {
							this._create.visible = false;
							this._join.visible = true;
					}
					if (e.code === 'ArrowUp') {
						this._currentSelectCreate--;
						if (this._create.visible === true) {
							this._currentSelectCreate = selectMaxCreate;
							this.state = menuState.CREATE_MENU;
						}
						else
							this.state = menuState.JOIN_MENU;
					}
					if (e.code === 'ArrowDown') {
						this._currentSelectCreate++;
						if (this._create.visible === true) {
							this._currentSelectCreate = 0;
							this.state = menuState.CREATE_MENU;
						}
						else
							this.state = menuState.JOIN_MENU;
					}
					console.log("current select : " + this._currentSelectCreate);
					break;
			case menuState.CREATE_MENU:
					if (e.code === 'ArrowUp') {
						this._currentSelectCreate--;
						if (this._currentSelectCreate === -1)
							this.state = menuState.SELECT_MENU;

					}
					if (e.code === 'ArrowDown') {
						this._currentSelectCreate++;
						if (this._currentSelectCreate > selectMaxCreate)
							this.state = menuState.SELECT_MENU;

					}

					// if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {

					// }

					if (this._currentSelectCreate === 0) {
						if (e.key === "Backspace") {
							this._inputText = this._inputText.slice(0, -1);
						}
						else if (e.key.length === 1) {
							this._inputText += e.key;
						}
						this._textInputField.text = this._inputText;
						console.log("current select : " + this._currentSelectCreate);
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

	public onKeyUp() {

	}

	//=======================================
	// UTILS 
	//=======================================
	


	//=======================================
	// UTILS 
	//=======================================

	private _pressUp () {
		if (this._currentSelectCreate === 0) {
			this.initInputTextName();
		}
		
	}

	private _pressDown () {
		if (this._currentSelectCreate === 0) {
			this.initInputTextName();
		}
		
	}

	private _pressLeft () {

	}

	private _pressRight () {

	}

	private _initTextCreate(text: PIXI.Text) {
		text.x = this.root.width * 10 / 100;
		text.y = this.root.height * 5 / 100;
		text.style.fontSize = ((this.root.width * 5) / 100);
		text.style.fill = defaultColor;
		text.filters = [glowFilter];
		return text;
	}

	private _initTextJoin(text: PIXI.Text) {
		text.x = this.root.width * 90 / 100 - text.width;
		text.y = this.root.height * 5 / 100;
		text.style.fontSize = ((this.root.width * 5) / 100);
		text.style.fill = 'green';
		text.filters = [glowFilter];
		return text;
	}

	private _initMenuCreate(): PIXI.Container {
			const menu = new PIXI.Container();
			const nameInputBox = new PIXI.Graphics();
			const name = new PIXI.Text("NAME:");
			const mode = new PIXI.Text("MODE: ");
			const nb_player = new PIXI.Text("PLAYER: ");
			const score_max = new PIXI.Text("MAX SCORE: ");

			// menuBox.beginFill('red'); 
			// menuBox.drawRect(0, 0, this.root.width - 20, 100);
			// menuBox.visible = true; 
			// menuBox.x = this.root.width / 2 - menuBox.width / 2;
			// menuBox.y = this.root.height / 2 - menuBox.height / 2;
			// menuBox.endFill();
			// menu.addChild(menuBox);
			
			name.style.fill = defaultColor;
			name.x = this.root.width / 5;
			name.y = (this.root.height * 30 / 100) - name.height / 2;
			name.style.fontSize = 10;
			menu.addChild(name);

			// nameInputBox.beginFill("red");
			nameInputBox.lineStyle(2, 0xFF0000, 1);
			nameInputBox.drawRect(0, 0, this.root.width * 30 / 100, 10);
			nameInputBox.visible = true; 
			nameInputBox.x = (this.root.width - nameInputBox.width) - this.root.width / 5;
			nameInputBox.y = name.y;
			nameInputBox.endFill();
			menu.addChild(nameInputBox);

			this._textInputField.x = (this.root.width - nameInputBox.width) - this.root.width / 5;
			this._textInputField.y = name.y - nameInputBox.height / 2; 
			menu.addChild(this._textInputField);

			mode.style.fill = defaultColor;
			mode.x = this.root.width / 5;
			mode.y = (this.root.height * 17 / 100) + name.y - mode.height / 2;
			mode.style.fontSize = 10;
			menu.addChild(mode);

			nb_player.style.fill = defaultColor;
			nb_player.x = this.root.width / 5;
			nb_player.y = (this.root.height * 17 / 100) + mode.y - nb_player.height / 2;
			nb_player.style.fontSize = 10;
			menu.addChild(nb_player);

			score_max.style.fill = defaultColor;
			score_max.x = this.root.width / 5;
			score_max.y = (this.root.height * 17 / 100) + nb_player.y - score_max.height / 2;
			score_max.style.fontSize = 10;
			menu.addChild(score_max);

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
	

}