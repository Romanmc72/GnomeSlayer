import { SpriteContainer } from '../types';
import Projectile from './projectile';
import Player from '../characters/player';
import Enemy from '../characters/enemy';
import config from '../config';

/**
 * The dimensions and position of the weapon's icon (standardized)
 */
export const WEAPON_ICON_DIMENSIONS = {
  height: 52,
  width: 48,
  x: config.scale.width - 72,
  y: 48,
};

/**
 * Represents a weapon whose ammo is infinite
 */
export type INFINITE = 'Inf';

/**
 * The default interface for a given type of weapon
 */
interface Weapon extends SpriteContainer {
  /**
   * The player to which this weapon belongs
   */
  player: Player;
  /**
   * The function that fires the weapon when called. Should perform both melee
   * and projectile if weapon does both
   * @returns - Nothing
   */
  fire: () => void;
  /**
   * The projectile that this weapon launches (if it has one)
   */
  projectile?: Projectile;
  /**
   * The ammunition for the weapon
   */
  ammo: number | INFINITE;
  /**
   * How much melee damage this weapon does
   */
  meleeDamage: number;
  /**
   * Whether or not the weapon can currently be fired
   */
  canFire: boolean;
  /**
   * The rate at which the weapon can be fired again, measured in rounds per second
   */
  rateOfFire: number;
  /**
   * Whether or not this weapon can be dropped
   */
  canDrop: boolean;
  /**
   * How many seconds it takes to reload the weapon
   */
  reloadTime?: number;
  /**
   * How many rounds fit in a clip before reload is required
   */
  clipSize?: number;
  /**
   * The method to call when the weapon collides with an enemy
   */
  onHit: (enemy: Enemy) => void;
  /**
   * An optional collider object if this weapon detects collisions
   */
  collider?: Phaser.Physics.Arcade.Collider;
  /**
   * The icon for the weapon.
   */
  icon?: Phaser.Physics.Arcade.Image;
  /**
   * Toggle whether or not the icon is displayed
   * @param display - True will display the icon, False will hide it
   * @returns - Nothing
   */
  displayIcon: (display: boolean) => void;
}

export default Weapon;
