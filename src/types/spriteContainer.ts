import Phaser from 'phaser';
import { Level } from './level';

/**
 * The interface for an object that contains a sprite
 */
export interface SpriteContainer {
  /**
   * The depth of the sprite on screen, defaults are
   * that sprites have no depth so this should fix that
   */
  depth: number;
  /**
   * The scene that the sprite is a part of
   */
  scene: Level;
  /**
   * The sprite itself. Defaults to undefined as it cannot be initialized
   * until the SpriteContainer.create() method is called.
   */
  sprite?: Phaser.Physics.Arcade.Sprite;
  /**
   * The array of physics collisions/overlaps to detect
   */
  colliders: Phaser.Physics.Arcade.Collider[];
  /**
   * Creates the colliders, intended to separate the business of creating
   * sprites from that of creating the collisions between them, that way we
   * don't get into a circular dependency issue between the two attempting to
   * create both simultaneously
   */
  createColliders: () => void;
  /**
   * To be run during the preload phase of the scene.
   * @returns Nothing. Uses the scene to preload the sprite sheet
   */
  preload: () => void;
  /**
   * To be run during the preload phase of the scene. This must set the
   * sprite attribute.
   * @returns Nothing. This will set the sprite attribute.
   */
  create: () => void;
  /**
   * This will update the sprite as parts of the scene interact with it.
   * @returns Nothing.
   */
  update: () => void;
}

/**
 * The props you will definitely need if you are initializing a new sprite
 */
export interface SpriteContainerProps {
  /**
   * The scene the sprite will live in
   */
  scene: Level;
  /**
   * The frame rate for the sprite's animations
   */
  frameRate: number;
  /**
   * The height of one frame from the spritesheet
   */
  frameHeight: number;
  /**
   * The width of one frame from the spritesheet
   */
  frameWidth: number;
  /**
   * The name of this particular sprite
   */
  name: string;
  /**
   * The name of the spritesheet in the public/assets/ folder
   * without the file extension or the path
   */
  spritesheet: string;
}
