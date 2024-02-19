import { PixiManager } from './PixiManager';
import { SceneMenu } from './scenes/SceneMenu';
import { SceneMenuOption } from './scenes/SceneMenuOption';
import WebFont from 'webfontloader';
import { SceneMenuTournament } from './scenes/SceneMenuTournament';
import { SceneGameVsBot } from './scenes/SceneGameVsBot';
import { SceneTournamentLoadingVs } from './scenes/SceneTournamentLoadingVs';
import { SceneTournamentWinner } from './scenes/SceneTournamentWinner';
import { SceneMenu2 } from './scenes/SceneMenu2';

// import { SceneTournamentWinner } from './scenes/SceneTournamentWinner';

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
