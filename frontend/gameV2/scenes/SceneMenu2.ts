import * as PIXI from 'pixi.js';
import { SceneBase } from "./SceneBase";
import { SceneGame } from "./SceneGame";
// import {textStyleDefault, textStyleTitle } from "../index";
// import { GlowFilter } from "@pixi/filter-glow";

export class SceneMenu2 extends SceneBase {


  private _vsPlayer = true;
  private _menuBox1 = new PIXI.Graphics();
  private _menuBox2 = new PIXI.Graphics();


  //=======================================
  // Effects
  //=======================================

  //   private _glowFilter = new GlowFilter({
  //     distance: 30,
  //     outerStrength: 1.2,
  //     innerStrength: 0,
  //     color: 0x86FF86,
  // });

  //=======================================
  // HOOK
  //=======================================

  public onStart(container: PIXI.Container) {
    // init menu
    container.addChild(this._menuBoxInit);
    container.addChild(this._menuBox2);
    container.addChild(this._initTextPlayerVsPlayer());
    container.addChild(this._initTextPlayerVsBot());

  }

  public onUpdate() {
 
  }

  public onFinish() {
  }

  public onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space') 
      this.root.loadScene(new SceneGame(this.root))
  }

  public onKeyUp() {

  }

  //=======================================
  // UTILS 
  //=======================================
  
  private _initTextPlayerVsPlayer () {
    
    const text = new PIXI.Text('Player\n  vs\n  Player', {fill: 0xFFFFFF});
    text.x = (this.root.width / 2) / 2 - text.width / 2;
    text.y = this.root.height / 2 - text.height / 2;
    return text;
  }

  private _initTextPlayerVsBot () {
    const text = new PIXI.Text('Player\n  vs\n  Bot', {fill: 0xFFFFFF});
    text.x = (this.root.width / 2) + (this.root.width / 4) - text.width / 2;
    text.y = this.root.height / 2 - text.height / 2;
    return text;
  }

  private _menuBoxInit () {

    
  }


  private _initTextTitle () {
    // this._textTitle.filters = [this._glowFilter];
    // return this._textTitle;
  }

  private _initTextSpace () {
    // this._spaceText.filters = [this._glowFilter];
    // return this._spaceText;
  }

  //=======================================
  // UTILS 
  //=======================================

}