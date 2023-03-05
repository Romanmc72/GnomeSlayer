import Phaser from 'phaser';
import { ILevel } from '../types';
import imageLocationFor from '../helpers';
import { DEFAULT_FRAME_RATE } from '../constants';
import { AnimationSettings } from '../types/animation';

/**
 * The interface for an object that contains a sprite
 */
export interface ISpriteContainer {
  /**
   * The depth of the sprite on screen, defaults are
   * that sprites have no depth so this should fix that
   */
  depth: number;
  /**
   * The scene that the sprite is a part of
   */
  scene: ILevel;
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
  /**
   * Override the current scene for this sprite container with a new one
   * @param scene The scene to which this object belongs
   * @returns Nothing
   */
  setScene: (scene: ILevel) => void;
}

/**
 * The props you will definitely need if you are initializing a new sprite
 */
export interface PartialSpriteContainerProps {
  /**
   * The scene the sprite will live in
   */
  scene: ILevel;
  /**
   * The frame rate for the sprite's animations
   */
  frameRate?: number;
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
  /**
   * The x coordinate to create at
   */
  x: number;
  /**
   * The y coordinate to create at
   */
  y: number;
}

export interface SpriteContainerProps extends PartialSpriteContainerProps {
  /**
   * The settings defining animations for this sprite
   */
  animationSettings: AnimationSettings;
  /**
   * The depth at which this object will render when created
   */
  depth: number;
}

export class SpriteContainer implements ISpriteContainer {
  public scene: ILevel;

  public name: string;

  public spritesheet: string;

  public frameHeight: number;

  public frameWidth: number;

  public animationSettings: AnimationSettings;

  public depth: number;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  public sprite?: Phaser.Physics.Arcade.Sprite;

  private x: number;

  private y: number;

  constructor(props: SpriteContainerProps) {
    this.scene = props.scene;
    this.name = props.name;
    this.spritesheet = props.spritesheet;
    this.frameHeight = props.frameHeight;
    this.frameWidth = props.frameWidth;
    this.animationSettings = props.animationSettings;
    this.x = props.x;
    this.y = props.y;
    this.depth = props.depth;
  }

  setScene(scene: ILevel): void {
    this.scene = scene;
  }

  preload(): void {
    this.scene.load.spritesheet(
      this.name,
      imageLocationFor(this.spritesheet),
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
  }

  getAnimationName(animationId: string): string {
    return `${this.name}${animationId}`;
  }

  create(): void {
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, this.name);
    this.sprite.setDepth(this.depth);
    Object.keys(this.animationSettings).forEach((settingId: string) => {
      const config = this.animationSettings[settingId];
      this.scene.anims.create({
        key: this.getAnimationName(settingId),
        frames: this.scene.anims.generateFrameNumbers(this.name, {
          start: config.frameStart,
          end: config.frameEnd,
        }),
        frameRate: config.frameRate ?? DEFAULT_FRAME_RATE,
        repeat: config.repeat ?? -1,
        yoyo: config.yoyo ?? false,
      });
    });
  }

  disableColliders(): void {
    this.colliders.forEach((collider) => {
      // eslint-disable-next-line no-param-reassign
      collider.active = false;
    });
  }

  enableColliders(): void {
    this.colliders.forEach((collider) => {
      // eslint-disable-next-line no-param-reassign
      collider.active = true;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  createColliders(): void {
    throw new Error('this.createColliders() not implemented!');
  }

  // eslint-disable-next-line class-methods-use-this
  update(): void {
    throw new Error('this.update() not implemented!');
  }
}

export default SpriteContainer;
