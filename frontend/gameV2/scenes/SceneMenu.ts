import * as PIXI from 'pixi.js';
import { SceneBase } from "./SceneBase";
import { SceneMenu2 } from "./SceneMenu2";
import {textStyleDefault, textStyleTitle } from "../index";
import { GlowFilter } from "@pixi/filter-glow";

export class SceneMenu extends SceneBase {

  private _textTitle = new PIXI.Text('PONG', textStyleTitle);
  private _spaceText = new PIXI.Text('PRESS SPACE TO START', textStyleDefault);

  //=======================================
  // Effects
  //=======================================

    private _glowFilter = new GlowFilter({
      distance: 30,
      outerStrength: 1.2,
      innerStrength: 0,
      color: 0x86FF86,
  });

  //=======================================
  // HOOK
  //=======================================

  public onStart(container: PIXI.Container) {
    //Init Title text
    container.addChild(this._initTextTitle())
    this._textTitle.x = this.root.width / 2 - this._textTitle.width / 2;
    this._textTitle.y = (this.root.height / 2) / 2 - this._textTitle.height / 2;

    //Init Space text
    container.addChild(this._initTextSpace())
    this._spaceText.x = this.root.width / 2 - this._spaceText.width / 2;
    this._spaceText.y = this.root.height - 100 - this._spaceText.height / 2;
  }

  public onUpdate() {
    setInterval(this._blinkText, 800);
  }

  public onFinish() {
  }

  public onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space') 
      this.root.loadScene(new SceneMenu2(this.root))
  }

  public onKeyUp() {

  }
  

  private _initTextTitle () {
    this._textTitle.filters = [this._glowFilter];
    return this._textTitle;
  }

  private _initTextSpace () {
    this._spaceText.filters = [this._glowFilter];
    return this._spaceText;
  }

  //=======================================
  // UTILS 
  //=======================================
  private _blinkText() {
    if (this._spaceText) {
        this._spaceText.visible = !this._spaceText.visible;
    }
  }

}
