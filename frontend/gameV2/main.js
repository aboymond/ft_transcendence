import { PixiManager } from "./PixiManager";
import { SceneMenu } from "./scenes/SceneMenu";
import { SceneMenu2 } from "./scenes/SceneMenu2";

// launch game
$(document).ready(function(){
    const pixiMan = new PixiManager(); 
    pixiMan.loadScene(new SceneMenu2(pixiMan))

});