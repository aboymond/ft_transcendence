import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import { GameState } from '../src/types';

export function launchGame(ws: WebSocket | null, gameState: GameState | null, userId: number | null) {
	const pixiMan = new PixiManager(ws, gameState, {}, userId);
	pixiMan.loadScene(new SceneMenu(pixiMan));
}
