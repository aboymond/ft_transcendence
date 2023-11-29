import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import {PixelateFilter} from '@pixi/filter-pixelate';

export const defaultColor = 0x1aff00;

// Menu 1 
export const textStyleTitleMenu1 = new PIXI.TextStyle({
  fontFamily: 'Pixelmania',
  fill: defaultColor,
  fontSize: 50
});

export const textStyleDefaultMenu1 = new PIXI.TextStyle({
  fontFamily: 'arial',
  fill: defaultColor,
  fontSize: 20
});

// Menu 2

export const textStylePVPMenu2 = new PIXI.TextStyle({
  fontFamily: 'Pixelmania',
  // fill: defaultColor,
  fontSize: $('#game_window').width() / 20
});

export const textStylePVBMenu2 = new PIXI.TextStyle({
  fontFamily: 'Pixelmania',
  // fill: defaultColor,
  fontSize: $('#game_window').width() / 20
});

// Menu Option

export const textStyleMenuOptionColor = new PIXI.TextStyle({

  fontSize: 20,
  fill: defaultColor
});
export const textStyleMenuOptionPad = new PIXI.TextStyle({

  fontSize: 20,
  fill: 'green'
});
export const textStyleMenuOptionLevel = new PIXI.TextStyle({

  fontSize: 20,
  fill: defaultColor
});
export const textStyleMenuOptionVictory = new PIXI.TextStyle({

  fontSize: 20,
  fill: defaultColor
});
export const textStyleMenuOptionPlay = new PIXI.TextStyle({

  fontSize: 20,
  fill: defaultColor
});
export const textStyleMenuOptionError = new PIXI.TextStyle({

  fontSize: 20,
  fill: defaultColor
});

export const textStyleWinOrLoose = new PIXI.TextStyle({

  fontSize: 20,
  fontFamily: 'Pixelmania',
  fill: defaultColor
});


// Effects

export const glowFilter = new GlowFilter({
  distance: 30,
  outerStrength: 1.2,
  innerStrength: 0,
  color: 0x86FF86,
}) as unknown as PIXI.Filter;

export const PixelPad = new PixelateFilter({

}) as unknown as PIXI.Filter;

