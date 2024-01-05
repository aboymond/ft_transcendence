import * as PIXI from 'pixi.js';
import { PixiManager } from '../PixiManager';

export abstract class SceneBase {
	constructor(public root: PixiManager) {}

	public abstract onStart(container: PIXI.Container): void;
	public abstract onUpdate(delta: number): void;
	public abstract onFinish(): void;
	public abstract onKeyDown(e: KeyboardEvent): void;
	public abstract onKeyUp(e: KeyboardEvent): void;
}
