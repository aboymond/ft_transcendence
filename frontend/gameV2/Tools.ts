import * as PIXI from 'pixi.js';

export class Tools {

	public static resizeText(text: PIXI.Text, rootWidth: number, pourcent: number) {
		if (typeof rootWidth === 'number' && typeof text.style.fontSize === 'number') {
			const newFontSize = (rootWidth * pourcent) / 600;
			const fontSizeRatio = newFontSize / text.style.fontSize;
			text.style.fontSize *= fontSizeRatio;
		}
		return text;
	}

	public static resizeGraphics(graphic: PIXI.Graphics, rootWidth: number, pourcent: number) {
		const newWidth = (rootWidth * pourcent) / 100;
		const ratio = graphic.width / graphic.height;
		const newHigth = newWidth / ratio;

		graphic.height = newHigth;
		graphic.width = newWidth;
		return graphic;
	}

	public static resizeSprite(graphic: PIXI.Sprite, rootWidth: number, pourcent: number) {
		const newWidth = (rootWidth * pourcent) / 100;
		const ratio = graphic.width / graphic.height;
		const newHigth = newWidth / ratio;

		graphic.height = newHigth;
		graphic.width = newWidth;
		return graphic;
	}
}