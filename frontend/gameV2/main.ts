import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import { SceneJoin } from './scenes/SceneJoin';
import { GameState } from '../src/types';

export function launchGame(ws: WebSocket | null, gameState: GameState | null) {
	console.log('launchGame');
	const pixiMan = new PixiManager(ws, gameState);
	pixiMan.loadScene(new SceneMenu(pixiMan));
}
