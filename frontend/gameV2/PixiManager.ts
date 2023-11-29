import type { SceneBase } from "./scenes/SceneBase"
// import { jQuery as $ } from 'jquery'
import * as PIXI from 'pixi.js';

interface IPixiManagerOptions {
  backgroundAlpha: number
  antialias: boolean
}



export class PixiManager {
  
  public vsPlayer = false;
  public amountVictory = 5;
  public botLvl = 0.05;
  public playerAWin = true;
  
  private _currentScene?: SceneBase = undefined
  private _app: PIXI.Application

  constructor(readonly options: Partial<IPixiManagerOptions> = {}) {
    PIXI.settings.RESOLUTION = window.devicePixelRatio || 1
    
    this._app = new PIXI.Application({
      width: this.width,
      height: this.height,
      backgroundAlpha: options.backgroundAlpha ?? 0,
      antialias: options.antialias ?? true,
    })
    this._app.ticker.add((delta) => {
      if (this._currentScene === undefined) return;
      this._currentScene.onUpdate(delta)
    })
    window.addEventListener('keydown', this._onKeyDownBind);
    window.addEventListener('keyup', this._onKeyUpBind);
    $('#game_window').append(this._app.view);
  }

  public destroy() {
    window.removeEventListener('keydown', this._onKeyDownBind);
    window.removeEventListener('keyup', this._onKeyUpBind);
    this._app.destroy(true)
  }

  private _onKeyDownBind = this._onKeyDown.bind(this)
  private _onKeyDown(e: KeyboardEvent) {
    if (this._currentScene === undefined) return;
    this._currentScene.onKeyDown(e)
  }

  private _onKeyUpBind = this._onKeyUp.bind(this)
  private _onKeyUp(e: KeyboardEvent) {
    if (this._currentScene === undefined) return;
    this._currentScene.onKeyUp(e)
  }

  public loadScene(scene: SceneBase) {
    this._unmountedScene()
    const container = new PIXI.Container()
    
    this._currentScene = scene
    this._app.stage.addChild(container)
    this._currentScene.onStart(container)
  }

  private _unmountedScene() {
    if (this._currentScene === undefined) return;
    this._currentScene.onFinish()
    this._app.stage.removeChildren()
  }
  

  public get width () {
    return $('#game_window').width()
  }

  public get height () {
    return $('#game_window').height()
  }
} 