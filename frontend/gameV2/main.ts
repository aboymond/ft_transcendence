import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import { SceneJoin } from './scenes/SceneJoin';
// import { SceneTournamentLoadingVs } from './scenes/SceneTournamentLoadingVs';
import { GameState } from '../src/types';
import WebFont from 'webfontloader';
import { SceneMenu2 } from './scenes/SceneMenu2';
import { SceneMenuOption } from './scenes/SceneMenuOption';

export function launchGame(ws: WebSocket | null, gameState: GameState | null, userId: number | null) {
	WebFont.load({
		custom: {
			families: ['Pixelmania'],
			urls: ['/font/font.css'],
		},
		active: function () {
			const pixiMan = new PixiManager(ws, gameState, {}, userId);
			pixiMan.loadScene(new SceneMenuOption(pixiMan));
		},
	});
}
