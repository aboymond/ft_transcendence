import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import WebFont from 'webfontloader';
import { SceneTournamentWinner } from './scenes/SceneTournamentWinner';

export function launchGame(ws: WebSocket | null, userId: number | null) {
	WebFont.load({
		custom: {
			families: ['Pixelmania'],
			urls: ['/font/font.css'],
		},
		active: function () {
			const pixiMan = new PixiManager({}, ws, userId);
			pixiMan.loadScene(new SceneTournamentWinner(pixiMan, 22, "aboymond"));
		},
	});
}
