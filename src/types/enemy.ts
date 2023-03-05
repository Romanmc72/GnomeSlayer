import { ISpriteContainer } from './spriteContainer';
import { IWeapon } from '../generics';
import Player from '../characters/player';

/**
 * The generic interface for an enemy
 */
export interface Enemy extends ISpriteContainer {
  /**
   * The amount of health this enemy has
   */
  health: number;
  /**
   * How much attack damage this enemy will do to the player
   */
  attackDamage: number;
  /**
   * The weapon (if the enemy has one)
   *
   * @default undefined
   */
  weapon?: IWeapon;
  /**
   * The jump height of the enemy
   */
  jump: number;
  /**
   * Whether or not this enemy is alive
   */
  isAlive: boolean;
  /**
   * Attacks the player using the attack damage
   * @param player - The player to attack
   * @returns - Nothing
   */
  attack: (player: Player) => void;
  // block: () => void;
  /**
   * Decrement the Enemy's health by the amount of damage passed in
   * @param damage - Amount of damage to receive
   * @returns - Nothing
   */
  takeDamage: (damage: number) => void;
  /**
   * Determines if an enemy can or cannot take damage from a particular weapon
   * @param weapon - The weapon type
   * @returns - Whether or not the enemy is immune to attack from this weapon
   */
  isImmune: (weapon: IWeapon) => boolean;
  /**
   * Flips the isAlive flag and cleans up other active properties of the enemy
   * to make them truly dead
   * @returns - Nothing
   */
  die: () => void;
}
