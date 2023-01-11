import Player from '../characters/player';
import { Enemy } from './enemy';
import { SpriteContainer } from './spriteContainer';

/**
 * The interface defining properties for a projectile or bullet.
 */
export interface Projectile extends SpriteContainer {
  /**
   * How fast the projectile moves.
   */
  velocity: number;
  /**
   * The direction the projectile travels in, defined in radians.
   */
  direction: number;
  /**
   * The damage a projectile will deal when it hits an object.
   */
  damage: number;
  /**
   * How far the projectile can travel before it stops.
   */
  range: number;
  /**
   * The effect of gravity on the projectile.
   */
  gravity: number;
  /**
   * The projectile's point of origin X coordinate
   */
  origin_x: number;
  /**
   * The projectile's point of origin Y coordinate
   */
  origin_y: number;
  /**
   * The current X coordinate of the projectile
   */
  x: number;
  /**
   * The current Y coordinate of the projectile
   */
  y: number;
  /**
   * The function to call when the projectile hits an object
   * @param object - The object the projectile has hit
   * @returns - Nothing.
   */
  hit: (object: Player | Enemy) => void;
  /**
   * The function to call when the projectile stops
   * @returns - Nothing.
   */
  stop: () => void;
  /**
   * Whether or not the projectile is still moving
   */
  isMoving: boolean;
}
