import { PixiManager } from './PixiManager';
// import { SceneGameVsBot } from './scenes/SceneGameVsBot';
import { SceneMenu } from './scenes/SceneMenu';
// import { SceneMenu2 } from './scenes/SceneMenu2';
// import { SceneMenuOption } from './scenes/SceneMenuOption';
// import { SceneWinOrLoose } from './scenes/SceneWinOrLoose';
import { SceneMenuTournament } from './scenes/SceneMenuTournament';

// launch game
export function launchGame() {
	const pixiMan = new PixiManager();
	pixiMan.loadScene(new SceneMenu(pixiMan));
}
