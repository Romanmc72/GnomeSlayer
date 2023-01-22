import config from './config';
import { Infinity } from './types';

// The infinity symbol in unicode
export const INFINITY: Infinity = '\u221E';

export const IMAGES_LOCATION = 'assets/';

export const DEFAULT_DEPTH = 50;

export const ENEMY_DEPTH = DEFAULT_DEPTH - 1;

/**
 * The dimensions and position of the weapon's icon (standardized)
 */
export const WEAPON_ICON_DIMENSIONS = {
  height: 52,
  width: 48,
  x: config.scale.width - 72,
  y: 80,
  depth: DEFAULT_DEPTH + 100,
};
