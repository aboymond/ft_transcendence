import * as PIXI from 'pixi.js';
import { PixiManager } from '../PixiManager';

export abstract class SceneBase {
	constructor(public root: PixiManager) {}

	public abstract onStart(container: PIXI.Container);
	public abstract onUpdate(delta: number);
	public abstract onFinish();
	public abstract onKeyDown(e: KeyboardEvent);
	public abstract onKeyUp(e: KeyboardEvent);
	public abstract updateState(data: any): void;
}
