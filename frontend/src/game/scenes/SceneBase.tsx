// import * as PIXI from 'pixi.js';

// export abstract class SceneBase {
// 	constructor(public root: PixiManager) {}

// 	public abstract onStart(container: PIXI.Container): void;
// 	public abstract onUpdate(delta: number): void;
// 	public abstract onFinish(): void;
// 	public abstract onKeyDown(e: KeyboardEvent): void;
// 	public abstract onKeyUp(e: KeyboardEvent): void;
// }

import { Container } from '@pixi/react';
import React, { useEffect, useRef } from 'react';

export interface SceneBaseProps {
	children?: React.ReactNode;
	onStart?: (container: React.RefObject<Container>) => void;
	onUpdate?: (delta: number) => void;
	onFinish?: () => void;
	onKeyDown?: (e: KeyboardEvent) => void;
	onKeyUp?: (e: KeyboardEvent) => void;
}

export const SceneBase: React.FC<SceneBaseProps> = ({
	children,
	onStart,
	onUpdate,
	onFinish,
	onKeyDown,
	onKeyUp,
}) => {
	const containerRef = useRef<Container>(null);

	useEffect(() => {
		if (onStart && containerRef.current) {
			onStart(containerRef.current);
		}

		return () => {
			if (onFinish) {
				onFinish();
			}
		};
	}, [onStart, onFinish]);

	useEffect(() => {
		let animationFrameId: number;

		const handleUpdate = () => {
			if (onUpdate) {
				onUpdate(0); // Replace 0 with the actual delta time
			}
			animationFrameId = requestAnimationFrame(handleUpdate);
		};

		animationFrameId = requestAnimationFrame(handleUpdate);

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [onUpdate]);

	return <Container ref={containerRef}>{children}</Container>;
};
