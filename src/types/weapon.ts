import { SpriteContainer } from './spriteContainer';
import { Projectile } from './projectile';
import Player from '../characters/player';
import { Enemy } from './enemy';
import Clip from '../weapons/clip';

/**
 * Represents a weapon whose ammo is  either finite or infinite
 */
export type Infinity = 'Inf';

/**
 * The default interface for a given type of weapon
 */
export interface Weapon extends SpriteContainer {
  /**
   * The player to which this weapon belongs
   */
  player?: Player;
  /**
   * If the weapon does not belong to a player, then this is its X coordinate
   */
  x?: number;
  /**
   * If the weapon does not belong to a player, then this is its Y coordinate
   */
  y?: number;
  /**
   * The function that fires the weapon when called. Should perform both melee
   * and projectile if weapon does both
   * @returns - Nothing
   */
  fire: () => void;
  /**
   * The ammunition for the weapon
   */
  ammo: Projectile[] | Infinity;
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
   * Whether or not the weapon is dropped
   */
  isDropped: boolean;
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
  /**
   * Reloads the weapon with a new clip from the available ammo
   */
  reload: () => void;
  /**
   * Whether or not this is a Melee weapon
   */
  isMelee: boolean;
  /**
   * Whether or not this is a projectile weapon
   */
  isProjectile: boolean;
}

/**
 * For weapons whose only means of damage is melee attack
 */
export interface MeleeOnlyWeapon extends Weapon {
  /**
   * How much melee damage this weapon does
   */
  meleeDamage: number;
  /**
   * An optional collider object if this weapon detects collisions
   */
  collider?: Phaser.Physics.Arcade.Collider;
  /**
   * The method to call when the weapon collides with an enemy
   * @param enemy - The enemy to collide with on Melee
   * @returns Nothing
   */
  onHit: (enemy: Enemy) => void;
}

/**
 * For weapons whose only means of damage is launching projectiles
 */
export interface ProjectileOnlyWeapon<T extends Projectile> extends Weapon {
  /**
   * The projectile type from which to preload the image
   */
  projectile: T;
  /**
   * How many seconds it takes to reload the weapon
   */
  reloadTime?: number;
  /**
   * How many rounds fit in a clip before reload is required
   */
  clipSize?: number;
  /**
   * How many rounds are in the current clip
   */
  currentClip: Clip<T>;
  /**
   * If the weapon fires projectiles, then these are the projectiles it fires
   */
  ammoType?: Projectile;
}

export interface MeleeAndProjectileWeapon<T extends Projectile> extends MeleeOnlyWeapon,
  ProjectileOnlyWeapon<T> {}
