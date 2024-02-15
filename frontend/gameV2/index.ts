import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { PixelateFilter } from '@pixi/filter-pixelate';
import $ from 'jquery';
import '/font/font.css';
import { sound } from '@pixi/sound';

export const defaultColor = 0x1aff00;

// Menu 1
export const textStyleTitleMenu1 = new PIXI.TextStyle({
	fontFamily: 'Pixelmania',
	fill: defaultColor,
	fontSize: 50,
});

export const textStyleDefaultMenu1 = new PIXI.TextStyle({
	fontFamily: 'arial',
	fill: defaultColor,
	fontSize: 20,
});

// Menu 2

export const textStylePVPMenu2 = new PIXI.TextStyle({
	fontFamily: 'Pixelmania',
	// fill: defaultColor,
	fontSize: ($('#game_window').width() || 600) / 20,
});

export const textStylePVBMenu2 = new PIXI.TextStyle({
	fontFamily: 'Pixelmania',
	// fill: defaultColor,
	fontSize: ($('#game_window').width() || 600) / 20,
});

export const textStyleJoinMenu2 = new PIXI.TextStyle({
	fontFamily: 'Pixelmania',
	fontSize: ($('#game_window').width() || 600) / 20,
});

export const textStyleTournamentMenu = new PIXI.TextStyle({
	fontFamily: 'Pixelmania',
	// fill: defaultColor,
	fontSize: ($('#game_window').width() || 600) / 20,
});

// Menu Option

export const textStyleMenuOptionColor = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});
export const textStyleMenuOptionPad = new PIXI.TextStyle({
	fontSize: 20,
	fill: 'green',
});
export const textStyleMenuOptionLevel = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});
export const textStyleMenuOptionVictory = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});
export const textStyleMenuOptionPlay = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});
export const textStyleMenuOptionError = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});

export const textStyleWinOrLoose = new PIXI.TextStyle({
	fontSize: 20,
	fontFamily: 'Pixelmania',
	fill: defaultColor,
});

//STYLE MENU TOURNAMENT

export const textStyleMenuTournamentCreate = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});

export const textStyleMenuTournamentName = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});

export const textStyleMenuTournamentPlayer = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});

export const textStyleMenuTournamentMaxScore = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});

export const textStyleMenuTournamentMode = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});

export const textStyleMenuTournamentJoin = new PIXI.TextStyle({
	fontSize: 20,
	fill: defaultColor,
});

// Effects

export const glowFilter = new GlowFilter({
	distance: 30,
	outerStrength: 1.2,
	innerStrength: 0,
	color: 0x86ff86,
}) as unknown as PIXI.Filter;

export const PixelPad = new PixelateFilter(undefined) as unknown as PIXI.Filter;

export function playSelectSound() {
	if (!sound.exists('select')) {
		sound.init();
		sound.add('select', './sound/Select.mp3');
	}
	sound.play('select');
	
}

export function playEnterSound() {
	if (!sound.exists('enter')) {
		sound.init();
		sound.add('enter', './sound/game-start.mp3');
	}
	sound.play('enter');
	
}

export function playTouchBallSound() {
	if (!sound.exists('touchBall')) {
		sound.init();
		sound.add('touchBall', './sound/touchBall.mp3')
	}
	sound.play('touchBall');
	
}

export function playTouchPadSound() {
	if (!sound.exists('touchPad')) {
		sound.init();
		sound.add('touchPad', './sound/touchPad.mp3')
	}
	sound.play('touchPad');
	
}

export function playLoadingPageSound() {
	if (!sound.exists('loading')) {
		sound.init();
		sound.add('loading', './sound/loadingPage.mp3')
	}
	sound.play('loading');
	
}

export function playWinSound() {
	if (!sound.exists('win')) {
		sound.init();
		sound.add('win', './sound/Winner.mp3')
	}
	sound.play('win');
	
}

export function playLooseSound() {
	if (!sound.exists('loose')) {
		sound.init();
		sound.add('loose', './sound/Looser.mp3')
	}
	sound.play('loose');
	
}