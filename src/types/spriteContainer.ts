import Phaser from 'phaser';

/**
 * The interface for an object that contains a sprite
 */
export interface SpriteContainer {
  /**
   * The scene that the sprite is a part of
   */
  scene: Phaser.Scene;
  /**
   * The sprite itself. Defaults to undefined as it cannot be initialized
   * until the SpriteContainer.create() method is called.
   */
  sprite?: Phaser.Physics.Arcade.Sprite;
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
