import config from './config';
import { Infinity } from './types';

/**
 * The dimensions and position of the weapon's icon (standardized)
 */
export const WEAPON_ICON_DIMENSIONS = {
  height: 52,
  width: 48,
  x: config.scale.width - 72,
  y: 48,
};

export const INFINITY: Infinity = 'Inf';
