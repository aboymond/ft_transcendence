import React, { useEffect, useRef } from 'react';
import { PixiManager } from '../game/PixiManager';
import { SceneMenu } from '../game/scenes/SceneMenu';

const Game: React.FC = () => {
	const gameContainer = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (gameContainer.current) {
			const pixiManager = new PixiManager();
			gameContainer.current.appendChild(pixiManager.view); // Append PIXI view to the gameContainer

			const scene = new SceneMenu(pixiManager); // Create a new SceneGame
			pixiManager.loadScene(scene); // Load the scene

			return () => {
				// Add any cleanup code for your game here
				pixiManager.destroy();
			};
		}
	}, []);

	return <div ref={gameContainer} />;
};

export default Game;
