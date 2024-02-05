import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import { GameState } from '../src/types';
import WebFont from 'webfontloader';

export function launchGame(ws: WebSocket | null, gameState: GameState | null, userId: number | null) {
	WebFont.load({
		custom: {
			families: ['Pixelmania'],
			urls: ['/font/font.css'],
		},
		active: function () {
			const pixiMan = new PixiManager(ws, gameState, {}, userId);
			pixiMan.loadScene(new SceneMenu(pixiMan));
		},
	});
}
