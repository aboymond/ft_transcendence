import * as PIXI from 'pixi.js';
import { SceneBase } from "./SceneBase";
import {defaultColor, glowFilter, textStyleMenuOption, textStyleMenuOption1, textStyleMenuOption2, textStyleMenuOption3, textStyleMenuOptionError} from "../index";
import { SceneGame } from './SceneGame';
// import { Sprite } from '@pixi/sprite';

const selectMax = 3;
let errorLock: boolean = false;

const chooseColor: string[] = ["GREEN", "IMPERIAL GREEN", "SUPER GREEN", "HYPER LIGHT GREEN", "PERFECT GEEN", "ECO FRIENDLY", "JEROME GREEN","JUST GREEN", "GREEN LANTERN", "BLUE + YELLOW", "0X1AFF00", "GREEN NEON"];
const chooseBotLevel: string[] = ["EASY", "MEDIUM", "HARD", "IMPOSSIBLE!!!"];
const botLvlNum: number[] = [0.5, 0.75, 0.9, 1];
const choosePad: string[] = ["BASIC", "LOCKED", "LOCKED", "LOCKED", "LOCKED", "LOCKED"];


const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const textures = [
  PIXI.Texture.from('gameV2/img/pad0.png'),
  PIXI.Texture.from('gameV2/img/pad1.png'),
  PIXI.Texture.from('gameV2/img/pad2.png'),
  PIXI.Texture.from('gameV2/img/pad3.png'),
  PIXI.Texture.from('gameV2/img/pad4.png'),
  PIXI.Texture.from('gameV2/img/pad5.png'),
  
];




export class SceneMenuOption extends SceneBase {
  
  
  private _currentSelect = 0
  
  private _currentColor = 0
  private _currentPad = 0
  private _currentBotLevel = 0
  
  private _padColor = new PIXI.Graphics();
  private _popError = new PIXI.Graphics();

  private _spritesPad: PIXI.Sprite[] = [];

  
  //=======================================
  // Effects
  //=======================================

  
  //=======================================
  // HOOK
  //=======================================

  private _textColorAvatar = new PIXI.Text('< CHOOSE COLOR >', textStyleMenuOption);
  private _textPad = new PIXI.Text('< CHOOSE PAD >', textStyleMenuOption1);
  private _textBotLevel = new PIXI.Text('< CHOOSE BOT LEVEL >', textStyleMenuOption2);
  private _textPlay = new PIXI.Text('PLAY', textStyleMenuOption3);
  private _textErrorPad = new PIXI.Text('SELECT AN AVALIBLE PAD', textStyleMenuOptionError);
  private _textErrorOK = new PIXI.Text('[ SPACE ]', textStyleMenuOptionError);
  

  public onStart(container: PIXI.Container) {
    // Init text
    container.addChild(this._createTextColorAvatar(this._textColorAvatar));
    container.addChild(this._createTextPad(this._textPad));
    container.addChild(this._createTextPlay(this._textPlay));
    
    
    container.addChild(this._createPadColor(this._padColor));
    this._padColor.y = (this._textColorAvatar.y - 20 );
    this._padColor.x = (this.root.width / 2 + this._padColor.width / 2);    

    if (this.root.vsPlayer === false) {
      container.addChild(this._createTextBotLevel(this._textBotLevel));
    }

    for (let i = 0; i < textures.length; i++) {
      this._spritesPad.push(new PIXI.Sprite(textures[i]));
    }

    for (let i = 0; i < this._spritesPad.length; i++) {
      container.addChild(this._spritesPad[i]);
      this._spritesPad[i].x = (this.root.width / 2) - 75;
      this._spritesPad[i].y = (this._textPad.y - 20 ) - 10;
      this._spritesPad[i].tint = 'green';
      this._spritesPad[i].visible = false;
      this._spritesPad[i].filters = [glowFilter];
    }
    this._spritesPad[0].visible = true;
    
    container.addChild(this._createPopError(this._popError));
    this._popError.y = (this.root.height / 2) + this._popError.height / 2;
    this._popError.x = this.root.width / 2 + this._popError.width / 2;
    container.addChild(this._createTextError(this._textErrorPad));
    container.addChild(this._createTextError(this._textErrorOK));
    this._textErrorOK.y = this._popError.y - 40;

  }

  public onUpdate() {
    this._updateMenuColor();
  }

  public onFinish() {

  }

  public onKeyDown(e: KeyboardEvent) {

    if (e.code === 'ArrowUp') {
      console.log('UP');
      if (!errorLock)
        this._pressUp();
    }
    if (e.code === 'ArrowDown') {
      console.log('DOWN');
      if (!errorLock)
        this._pressDown();
    }
    if (e.code === 'ArrowLeft') {
      console.log('LEFT');
      if (!errorLock)
        this._pressLeft();
    }
    if (e.code === 'ArrowRight') {
      console.log('RIGHT');
      if (!errorLock)
        this._pressRight();
    }
    if (e.code === 'Space') {
      console.log('SPACE');
      if (errorLock) {
        errorLock = false;
        this._popError.visible = false;
        this._textErrorOK.visible = false;
        this._textErrorPad.visible = false;
        console.log('in space');
      }
      else
        this._pressSpace();
    }
    
  }

  public onKeyUp() {

  }

  //=======================================
  // UTILS 
  //=======================================

  private _createTextColorAvatar(text: PIXI.Text) {

    text.filters = [glowFilter];
    text.y = (25 * this.root.height) / 100;
    text.x = this.root.width / 2 - text.width / 2;
    return (text);
  }

  private _createTextPad(text: PIXI.Text) {

    text.filters = [glowFilter];
    text.y = (75 * this.root.height) / 100;
    text.x = this.root.width / 2 - text.width / 2;
    
    return (text);
  }

  private _createTextBotLevel(text: PIXI.Text) {

    text.filters = [glowFilter];
    text.x = this.root.width / 2 - text.width / 2;
    text.y = this.root.height / 2 - text.height / 2;
    return (text);
  }

  private _createTextPlay(text: PIXI.Text) {

    text.filters = [glowFilter];
    text.x = this.root.width / 2 - text.width / 2;
    text.y = (this.root.height - text.height / 2) - 30;
    return (text);
  }

  private _createPadColor (pad: PIXI.Graphics) {
    pad.filters = [glowFilter];
    pad.beginFill(defaultColor);
    pad.drawRect(-50, -50, 50, 50);
    pad.endFill();
    return (pad);
  }

  private _createPopError(pop: PIXI.Graphics) {
    pop.filters = [glowFilter];
    pop.beginFill('green');
    pop.drawRect(-280, -150, 280, 150);
    pop.endFill();
    pop.visible = false;
    return (pop);
  }

  private _createTextError(error: PIXI.Text) {
    error.filters = [glowFilter];
    error.y = this._popError.y - this._popError.height + 50;
    error.x = this.root.width / 2 - error.width / 2;
    error.visible = false;
    return (error);
  }



  //=======================================
  // UTILS NAVIGATOR
  //=======================================

  private _pressSpace () {
    if ((!this.root.vsPlayer && this._currentSelect === 3) || (this.root.vsPlayer && this._currentSelect === 2)) {
      //play the game
      if (this._currentPad === 0)
        this.root.loadScene(new SceneGame(this.root));
      else {
        errorLock = true;
        this._popError.visible = true;
        this._textErrorOK.visible = true;
        this._textErrorPad.visible = true;
        console.log('TEST');

      }
        
    }
  }
  
  private _pressUp () {
    this._currentSelect--
    if (this._currentSelect === 1 && this.root.vsPlayer)
    this._currentSelect--;
    if (this._currentSelect < 0 )
      this._currentSelect = selectMax
  }
  
  private _pressDown () {
    this._currentSelect++
    if (this._currentSelect === 1 && this.root.vsPlayer)
      this._currentSelect++;
    if (this._currentSelect > selectMax )
      this._currentSelect = 0
  }
  
  private _pressLeft () {
    if (this._currentSelect === 0)
      return this._colorPrev()
    if (this._currentSelect === 2)
      return this._padPrev()
    if (!this.root.vsPlayer) {
      if (this._currentSelect === 1)
        return this._botLvlPrev()
    }
  }
  
  private _pressRight () {
    if (this._currentSelect === 0)
      return this._colorNext()
    if (this._currentSelect === 2)
      return this._padNext()
    if (!this.root.vsPlayer) {
      if (this._currentSelect === 1)
        return this._botLvlNext()
    }
  }

  private _colorPrev () {
    this._currentColor--;
    if (this._currentColor < 0)
      this._currentColor = chooseColor.length - 1
    this._textColorAvatar.text = "< " + chooseColor[this._currentColor] + " >";
    this._textColorAvatar.x = this.root.width / 2 - this._textColorAvatar.width / 2;
    this._updateColor();
  }

  private _colorNext () {
    this._currentColor++;
    if (this._currentColor > chooseColor.length - 1)
      this._currentColor = 0;
    this._textColorAvatar.text = "< " + chooseColor[this._currentColor] + " >";
     this._textColorAvatar.x = this.root.width / 2 - this._textColorAvatar.width / 2;
     this._updateColor();
  }

  private _padPrev () {
    this._spritesPad[this._currentPad].visible = false;
    this._currentPad--;
    if (this._currentPad < 0) 
      this._currentPad = choosePad.length - 1;
    this._spritesPad[this._currentPad].visible = true;
    this._textPad.text = "< " + choosePad[this._currentPad] + " >";
    this._textPad.x = this.root.width / 2 - this._textPad.width / 2;
  }

  private _padNext () {
    this._spritesPad[this._currentPad].visible = false;
    this._currentPad++;
    if (this._currentPad > choosePad.length - 1)
      this._currentPad = 0;
    this._spritesPad[this._currentPad].visible = true;
    this._textPad.text = "< " + choosePad[this._currentPad] + " >";
    this._textPad.x = this.root.width / 2 - this._textPad.width / 2;
  }

  private _botLvlPrev () {
    this._currentBotLevel--;
    if (this._currentBotLevel < 0)
    this._currentBotLevel = chooseBotLevel.length - 1;
    this._textBotLevel.text = "< " + chooseBotLevel[this._currentBotLevel] + " >";
    this._textBotLevel.x = this.root.width / 2 - this._textBotLevel.width / 2;
    this.root.botLvl = botLvlNum[this._currentBotLevel]; 
  }

  private _botLvlNext () {
    this._currentBotLevel++;
    if (this._currentBotLevel > chooseBotLevel.length - 1)
    this._currentBotLevel = 0;
    this._textBotLevel.text = "< " + chooseBotLevel[this._currentBotLevel] + " >";
    this._textBotLevel.x = this.root.width / 2 - this._textBotLevel.width / 2;
    this.root.botLvl = botLvlNum[this._currentBotLevel]; 
  }

  private _updateMenuColor () {
    if (this._currentSelect === 0) {
      this._padColor.tint = defaultColor;
      this._textColorAvatar.style.fill = defaultColor;
      this._textBotLevel.style.fill = 'green';
      this._spritesPad[this._currentPad].tint = 'green';
      this._textPad.style.fill = 'green';
      this._textPlay.style.fill = 'green';
    }
    else if (this._currentSelect === 1) {
      this._textColorAvatar.style.fill = 'green';
      this._padColor.tint = 'green';
      this._spritesPad[this._currentPad].tint = 'green';
      this._textBotLevel.style.fill = defaultColor;
      this._textPad.style.fill = 'green';
    }
    else if (this._currentSelect === 2) {
      this._padColor.tint = 'green';
      this._textColorAvatar.style.fill = 'green';
      this._textBotLevel.style.fill = 'green';
      this._spritesPad[this._currentPad].tint = defaultColor;
      this._textPad.style.fill = defaultColor;
      this._textPlay.style.fill = 'green';
    }
    else if (this._currentSelect === 3) {
      this._textColorAvatar.style.fill = 'green';
      this._padColor.tint = 'green';
      this._spritesPad[this._currentPad].tint = 'green';
      this._textPad.style.fill = 'green';
      this._textPlay.style.fill = defaultColor;
    }
  }

  async _updateColor() {
    this._padColor.clear();
    await sleep(150);
    this._padColor.beginFill(defaultColor);
    this._padColor.drawRect(-50, -50, 50, 50);
    this._padColor.y = (this._textColorAvatar.y - 20 );
    this._padColor.x = (this.root.width / 2 + this._padColor.width / 2);
    this._padColor.endFill();
  }


  

}
