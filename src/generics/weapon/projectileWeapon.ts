import { IProjectile } from '../projectile';
import { IWeapon } from './weaponBase';
import Clip from '../../weapons/clip';

/**
 * For weapons whose only means of damage is launching projectiles
 */
export interface IProjectileOnlyWeapon<T extends IProjectile> extends IWeapon {
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
  ammoType?: IProjectile;
}
