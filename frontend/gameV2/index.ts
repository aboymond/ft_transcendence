import * as PIXI from 'pixi.js';
// import { GlowFilter } from '@pixi/filter-glow';
import { GlowFilter } from '@pixi/filter-glow';
// import { Filter } from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';
import $ from 'jquery';
import '/font/font.css';
// import { Color } from 'pixi.js';
// import { sound } from '@pixi/sound';

// Filter.defaultResolution = 1;

export const defaultColor = 0x1aff00;
// const defaultGlowFillterColor = 0x86ff86;
// const rgbArray = Color.fromHex(defaultGlowFillterColor).toRgbArray();

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
	// color: [134, 255, 134],
});

export const PixelPad = new PixelateFilter(undefined) as unknown as PIXI.Filter;

export function glow(filter: null) {
	filter
	return filter;
}