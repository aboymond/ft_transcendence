import React, { useEffect, useRef } from 'react';
import { PixiManager } from '../../gameV2/PixiManager';
import IPixiManagerOptions from '../../gameV2/PixiManager.ts';
import SceneGame from '../../gameV2/scenes/SceneGame.ts';

const Game: React.FC = () => {
	const gameContainer = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (gameContainer.current) {
			const options: Partial<IPixiManagerOptions> = {
				backgroundAlpha: 1.0, // set your desired alpha
				antialias: true, // set your desired antialias value
			};
			const pixiManager = new PixiManager(options);
			gameContainer.current.appendChild(pixiManager.view); // Append PIXI view to the gameContainer

			const scene = new SceneGame(pixiManager); // Create a new SceneGame
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
