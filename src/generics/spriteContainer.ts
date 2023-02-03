import Phaser from 'phaser';
import { ISpriteContainer, Level, SpriteContainerProps } from '../types';
import imageLocationFor from '../helpers';
import { DEFAULT_DEPTH, DEFAULT_FRAME_RATE } from '../constants';
import { AnimationSettings } from '../types/animation';

export class SpriteContainer implements ISpriteContainer {
  public scene: Level;

  public name: string;

  public spritesheet: string;

  public frameHeight: number;

  public frameWidth: number;

  public frameRate: number;

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
    this.frameRate = props.frameRate;
    this.animationSettings = props.animationSettings;
    this.x = props.x;
    this.y = props.y;
    this.depth = props.depth;
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
