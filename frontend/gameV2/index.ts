import * as PIXI from 'pixi.js';
// import { GlowFilter } from '@pixi/filter-glow';

export const defaultColor = 0x1aff00;

export const textStyleTitle = new PIXI.TextStyle({
  fontFamily: 'Pixelmania',
  fill: defaultColor,
  fontSize: 50
});

export const textStyleDefault = new PIXI.TextStyle({
  fontFamily: 'arial',
  fill: defaultColor,
  fontSize: 20
});

// export const glowFilter = new GlowFilter({
//   distance: 30,
//   outerStrength: 1.2,
//   innerStrength: 0,
//   color: 0x86FF86,
// });

