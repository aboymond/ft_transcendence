import { PixiManager } from "./PixiManager";
import { SceneMenu } from "./scenes/SceneMenu";

// launch game
$(document).ready(function(){
    const pixiMan = new PixiManager(); 
    pixiMan.loadScene(new SceneMenu(pixiMan))

});