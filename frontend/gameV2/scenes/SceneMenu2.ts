import * as PIXI from 'pixi.js';
import { SceneBase } from "./SceneBase";
import { SceneGame } from "./SceneGame";
import { SceneMenuOption } from "./SceneMenuOption";
import { glowFilter, defaultColor, textStylePVPMenu2, textStylePVBMenu2} from "..";
// import { GlowFilter } from "@pixi/filter-glow";

export class SceneMenu2 extends SceneBase {


  // private _vsPlayer = this.root._vsPlayer;
  private _menuBox1 = new PIXI.Graphics();
  private _menuBox2 = new PIXI.Graphics(); 
  private _textPlayerVsPlayer = new PIXI.Text('PLAYER\n  VS\n  PLAYER', textStylePVPMenu2);
  private _textPlayerVsBot = new PIXI.Text('PLAYER\n  VS\n  BOT', textStylePVBMenu2);


  //=======================================
  // Effects
  //=======================================



  //=======================================
  // HOOK
  //=======================================

  public onStart(container: PIXI.Container) {
    // init menu
    container.addChild(this._menuBoxInit(this._menuBox1));
    container.addChild(this._menuBoxInit(this._menuBox2));
    container.addChild(this._initTextPlayerVsPlayer(this._textPlayerVsPlayer));
    container.addChild(this._initTextPlayerVsBot(this._textPlayerVsBot));
    this._textPlayerVsBot.style.fill = defaultColor;
    this._textPlayerVsPlayer.style.fill = 0x053100;
  }

  public onUpdate() {

  }

  public onFinish() {
  }

  public onKeyDown(e: KeyboardEvent) {
    if (e.code === 'ArrowRight') {
      this.root.vsPlayer = false;
      this._updateMenuColor(); 
    }
    if (e.code === 'ArrowLeft') {
      this.root.vsPlayer = true;
      this._updateMenuColor(); 
    }
    if (e.code === 'Space') {
      if (this.root.vsPlayer === false) {
        this.root.loadScene(new SceneGame(this.root));
      }
      else {
        this.root.loadScene(new SceneMenuOption(this.root));
      }
    }
  }

  public onKeyUp() {

  }

  //=======================================
  // UTILS 
  //=======================================
  
  private _initTextPlayerVsPlayer (text: PIXI.Text) {
    text.x = (this.root.width / 2) / 2 - text.width / 2;
    text.y = this.root.height / 2 - text.height / 2;
    text.filters = [glowFilter];
    return text;
  }

  private _initTextPlayerVsBot (text: PIXI.Text) {
    text.x = (this.root.width / 2) + (this.root.width / 4) - text.width / 2;
    text.y = this.root.height / 2 - text.height / 2;
    text.filters = [glowFilter];
    return text;
  }

  private _menuBoxInit (menuBox: PIXI.Graphics) {

    menuBox.clear();
    menuBox.beginFill(defaultColor);
    menuBox.drawRect(0, 0, this.root.width / 2, this.root.height);
    menuBox.endFill();
    // menuBox.filters = [glowFilter];
    
    return menuBox;
  }


  //=======================================
  // UTILS 
  //=======================================

  private _updateMenuColor () {

    if (this.root.vsPlayer === true) {
      this._menuBox2.clear();
      this._menuBox1.beginFill(defaultColor);
      this._menuBox1.drawRect(0, 0, this.root.width / 2, this.root.height);
      this._menuBox1.endFill();

      this._textPlayerVsBot.style.fill = defaultColor;
      this._textPlayerVsPlayer.style.fill = 0x053100;
    }

    if (this.root.vsPlayer === false) {
      this._menuBox1.clear();
      this._menuBox2.beginFill(defaultColor);
      this._menuBox2.drawRect(0, 0, (this.root.width / 2) + (this.root.width / 2), this.root.height);
      this._menuBox2.endFill();
      this._menuBox2.x = this.root.width / 2;

      this._textPlayerVsPlayer.style.fill = defaultColor;
      this._textPlayerVsBot.style.fill = 0x053100;
    }
  
  }
}