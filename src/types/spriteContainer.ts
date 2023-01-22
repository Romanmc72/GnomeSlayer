import Phaser from 'phaser';

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
  scene: Phaser.Scene;
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
