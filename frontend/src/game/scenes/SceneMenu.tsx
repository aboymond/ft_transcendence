import { SceneBase } from './SceneBase';
import { Text } from '@pixi/react';
import React, { useEffect, useState } from 'react';
import { textStyleTitleMenu1, textStyleDefaultMenu1 } from '../index';

export const SceneMenu: React.FC<{ loadScene: (sceneName: string) => void }> = ({ loadScene }) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			setIsVisible((v) => !v);
		}, 800);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			console.log('Enter pressed in SceneMenu, loading SceneMenu2');
			loadScene('menu2');
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	return (
		<SceneBase>
			<Text text="PONG" style={textStyleTitleMenu1} x={window.innerWidth / 2} y={window.innerHeight / 4} />
			{isVisible && <Text text="PRESS ENTER TO START" style={textStyleDefaultMenu1} />}
		</SceneBase>
	);
};

// import * as PIXI from 'pixi.js';
// import { SceneMenu2 } from './SceneMenu2';
// import { glowFilter, textStyleDefaultMenu1, textStyleTitleMenu1 } from '../index';

// import { PixiManager } from '../PixiManager';

// export class SceneMenu extends SceneBase {
// 	private _textTitle = new PIXI.Text('PONG', textStyleTitleMenu1);
// 	private _spaceText = new PIXI.Text('PRESS ENTER TO START', textStyleDefaultMenu1);
// 	private _interval = 0;

// 	//=======================================
// 	// Effects
// 	//=======================================

// 	//=======================================
// 	// HOOK
// 	//=======================================

// 	public onStart(container: PIXI.Container) {
// 		//Init Title text
// 		container.addChild(this._initTextTitle());
// 		this._textTitle.x = this.root.width / 2 - this._textTitle.width / 2;
// 		this._textTitle.y = this.root.height / 2 / 2 - this._textTitle.height / 2;

// 		//Init Space text
// 		container.addChild(this._initTextSpace());
// 		this._spaceText.x = this.root.width / 2 - this._spaceText.width / 2;
// 		this._spaceText.y = this.root.height - 100 - this._spaceText.height / 2;

// 		this._interval = setInterval(() => {
// 			if (this._spaceText) {
// 				this._spaceText.visible = !this._spaceText.visible;
// 			}
// 			console.log(this._spaceText);
// 		}, 800);
// 	}

// 	public onUpdate() {}

// 	public onFinish() {
// 		clearInterval(this._interval);
// 	}

// 	public onKeyDown(e: KeyboardEvent) {
// 		if (e.code === 'Enter') this.root.loadScene(new SceneMenu2(this.root));
// 	}

// 	public onKeyUp() {}

// 	private _initTextTitle() {
// 		this._textTitle.filters = [glowFilter];
// 		return this._textTitle;
// 	}

// 	private _initTextSpace() {
// 		this._spaceText.filters = [glowFilter];
// 		return this._spaceText;
// 	}

// 	//=======================================
// 	// UTILS
// 	//=======================================
// }
