import Player from '../characters/player';
import { Enemy } from './enemy';
import { SpriteContainer } from './spriteContainer';

/**
 * The minimum required attributes to create a Level in which the game can be played
 */
export interface Level extends Phaser.Scene {
  /**
   * The player that will be controlled by the person playing this game
   */
  player: Player;
  /**
   * The array of enemies that will be on screen
   */
  gnomes: Enemy[];
  /**
   * Any other interactive or animated in game objects to render and track
   */
  objects: SpriteContainer[];
  /**
   * The ground upon which the player and enemies will walk
   */
  ground?: Phaser.Physics.Arcade.StaticGroup | Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
}
