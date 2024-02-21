import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import WebFont from 'webfontloader';
import { SceneMenuOption } from './scenes/SceneMenuOption';
import { SceneWinOrLooseLocal } from './scenes/SceneWinOrLooseLocal';

import { SceneMenu2 } from './scenes/SceneMenu2';


export function launchGame(ws: WebSocket | null, userId: number | null) {
	WebFont.load({
		custom: {
			families: ['Pixelmania'],
			urls: ['/font/font.css'],
		},
		active: function () {
			const pixiMan = new PixiManager({}, ws, userId);
			pixiMan.loadScene(new SceneMenu2(pixiMan));
		},
	});
}
