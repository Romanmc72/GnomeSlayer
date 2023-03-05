import Player, { PlayerProps } from '../characters/player';
import { Enemy } from './enemy';
import { ISpriteContainer } from './spriteContainer';

/**
 * The interface for data passed between levels
 */
export interface IntraLevelData {
  /**
   * The data to pass concerning a player, passed between levels
   */
  player?: PlayerProps;
}

/**
 * The minimum required attributes to create a Level in which the game can be played
 */
export interface ILevel extends Phaser.Scene {
  /**
   * The player that will be controlled by the person playing this game
   */
  player: Player;
  /**
   * The array of enemies that will be on screen
   */
  gnomes: Enemy[];
  /**
   * The ground upon which the player and enemies will walk
   */
  ground?: Phaser.Physics.Arcade.StaticGroup | Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  /**
   * Getter method for the game's height
   * @returns The max height of the game
   */
  getHeight: () => number;
  /**
   * Getter method for the game's width
   * @returns The max width of the game
   */
  getWidth: () => number;
  /**
   * Adds an object to the array of game objects
   * @param object - The object to add
   */
  addObject: (object: ISpriteContainer) => void;
  /**
   * Start the next scene and pass data along
   * @param data The data to pass to the next level
   */
  nextLevel: (levelName: string, data?: IntraLevelData) => void;
}
