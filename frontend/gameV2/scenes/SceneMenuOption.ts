import * as PIXI from 'pixi.js';
import { SceneBase } from "./SceneBase";
import {defaultColor, glowFilter, textStyleMenuOption, textStyleMenuOption1, textStyleMenuOption2, textStyleMenuOption3, PixelPad } from "../index";




const selectMax = 3;

const chooseColor: string[] = ["GREEN", "IMPERIAL GREEN", "SUPER GREEN", "HYPER LIGHT GREEN", "PERFECT GEEN", "ECO FRIENDLY", "JEROME GREEN","JUST GREEN", "GREEN LANTERN", "BLUE + YELLOW", "0X1AFF00", "GREEN NEON"];
const chooseBotLevel: string[] = ["EASY", "MEDIUM", "HARD", "IMPOSSIBLE!!!"];
const botLvlNum: number[] = [0.5, 0.75, 0.9, 1];
const choosePad: string[] = ["BASIC", "LOCKED", "LOCKED", "LOCKED", "LOCKED", "LOCKED"];




export class SceneMenuOption extends SceneBase {
    

  private _currentSelect = 0

  private _currentColor = 0
  private _currentPad = 0
  private _currentBotLevel = 0


  private _pad = new PIXI.Graphics();
  private _padColor = new PIXI.Graphics();
  



// padA.filters = [padPixel as unknown as Filter];
  
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
  private _textBotLvl = new PIXI.Text('test');
  

  public onStart(container: PIXI.Container) {
    console.log('in on start ' + this.root.vsPlayer);
    // Init text
    container.addChild(this._createTextColorAvatar(this._textColorAvatar));
    container.addChild(this._createTextPad(this._textPad));
    container.addChild(this._createTextPlay(this._textPlay));

    container.addChild(this._createPadColor(this._padColor));
    this._padColor.y = (this._textColorAvatar.y - 20 );
    this._padColor.x = (this.root.width / 2 + this._padColor.width / 2);

    container.addChild(this._createPad(this._pad));
    this._pad.y = (this._textPad.y - 20 );
    this._pad.x = (this.root.width / 2 + this._pad.width / 2);
    

    if (this.root.vsPlayer === false) {
      container.addChild(this._createTextBotLevel(this._textBotLevel));
    }
    // this._textColorAvatar.style.fill = defaultColor;


  }

  public onUpdate() {
this._updateMenuColor();
// console.log('update ' + this._currentSelect);
  }

  public onFinish() {

  }

  public onKeyDown(e: KeyboardEvent) {
    // this._updateMenuColor();
    if (e.code === 'ArrowUp') {
      console.log('UP');
      this._pressUp();
    }
    if (e.code === 'ArrowDown') {
      console.log('DOWN');
      this._pressDown();
    }
    if (e.code === 'ArrowLeft') {
      console.log('LEFT');
      this._pressLeft();
    }
    if (e.code === 'ArrowRight') {
      console.log('RIGHT');
      this._pressRight();
    }
    if (e.code === 'Space') {
      console.log('SPACE');
      this._pressSpace();
    }
    

    //   this.root.loadScene(new SceneMenu2(this.root))
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
  private _createPad (pad: PIXI.Graphics) {
    pad.filters = [glowFilter];
    pad.beginFill(defaultColor);
    pad.drawRect(-100, -10, 100, 10);
    pad.endFill();
    return (pad);
  }

  //=======================================
  // UTILS NAVIGATOR
  //=======================================

  private _pressSpace () {
    if ((!this.root.vsPlayer && this._currentSelect === 3) || (this.root.vsPlayer && this._currentSelect === 2)) {
      //play the game
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

  }

  private _colorNext () {
    this._currentColor++;
    if (this._currentColor > chooseColor.length - 1)
      this._currentColor = 0;
      this._textColorAvatar.text = "< " + chooseColor[this._currentColor] + " >";
      this._textColorAvatar.x = this.root.width / 2 - this._textColorAvatar.width / 2;
  }

  private _padPrev () {
    this._currentPad--;
    if (this._currentPad < 0)
    this._currentPad = choosePad.length - 1;
    this._textPad.text = "< " + choosePad[this._currentPad] + " >";
    this._textPad.x = this.root.width / 2 - this._textPad.width / 2;
  }

  private _padNext () {
    this._currentPad++;
    if (this._currentPad > choosePad.length - 1)
    this._currentPad = 0;
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

    console.log('update color ' + this._currentSelect);
    if (this._currentSelect === 0) {
      this._textColorAvatar.style.fill = defaultColor;
      this._padColor.tint = defaultColor;
    
      this._textBotLevel.style.fill = 'green';
      this._textPlay.style.fill = 'green';
    }

    else if (this._currentSelect === 1) {
      this._textColorAvatar.style.fill = 'green';
      this._padColor.tint = 'green';
      this._textBotLevel.style.fill = defaultColor;
      this._textPad.style.fill = 'green';
    }

    else if (this._currentSelect === 2) {
      this._textBotLevel.style.fill = 'green';
      this._textPad.style.fill = defaultColor;
      this._textPlay.style.fill = 'green';
    }

    else if (this._currentSelect === 3) {
      this._textColorAvatar.style.fill = 'green';
      this._padColor.beginFill('green');
      this._textPad.style.fill = 'green';
      this._textPlay.style.fill = defaultColor;
    }
  }



}
