import React, { useRef, useState } from 'react';
import { Stage } from '@pixi/react';
import { SceneMenu } from '../game/scenes/SceneMenu';
import { SceneMenu2 } from '../game/scenes/SceneMenu2';

const Game: React.FC = () => {
	const [currentScene, setCurrentScene] = useState('menu');
	const gameContainer = useRef(null);
	const loadScene = (sceneName: string) => {
		console.log(`Loading scene: ${sceneName}`);
		setCurrentScene(sceneName);
	};

	let scene;
	switch (currentScene) {
		case 'menu':
			scene = <SceneMenu loadScene={loadScene} />;
			break;
		case 'menu2':
			scene = <SceneMenu2 loadScene={loadScene} />;
			break;
		// Add more cases as needed
	}

	return (
		<div ref={gameContainer}>
			<Stage>{scene}</Stage>
		</div>
	);
};

export default Game;
