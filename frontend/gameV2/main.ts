import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import WebFont from 'webfontloader';

export function launchGame(ws: WebSocket | null, userId: number | null) {
	WebFont.load({
		custom: {
			families: ['Pixelmania'],
			urls: ['/font/font.css'],
		},
		active: function () {
			const pixiMan = new PixiManager({}, ws, userId);
			pixiMan.loadScene(new SceneMenu(pixiMan));
		},
	});
}
