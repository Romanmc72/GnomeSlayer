import {
  IKey,
  KeyCarrier,
  KeyType,
  Level,
  ILock,
} from '../types';
import { DEFAULT_DEPTH } from '../constants';
import imageLocationFor from '../helpers';

/**
 * The properties required to instantiate a key
 */
export interface KeyProps {
  /**
   * The level in which this key exists
   */
  scene: Level;
  /**
   * The type of key belonging to a certain type of lock
   */
  type: KeyType;
  /**
   * The x position of the key to start (if it is free floating and not carried)
   * You must specify both X and Y OR the carrier. If both are specified carrier
   * will take precedence. If neither are specified then an error will be thrown.
   */
  x?: number;
  /**
   * The y position of the key to start (if it is free floating and not carried)
   * You must specify both X and Y OR the carrier. If both are specified carrier
   * will take precedence. If neither are specified then an error will be thrown.
   */
  y?: number;
  /**
   * The carrier of the key, this will override the x and y props if it is set
   * as the key's x and y will be set to that of the carrier.
   */
  carrier?: KeyCarrier;
  /**
   * The name of the spritesheet for this key.
   */
  spritesheet: string;
  /**
   * The name of the key object.
   */
  name: string;
  /**
   * The frame number for the key when it is not spinning
   */
  stillFrame: number;
  /**
   * The total number of frames in the spinning animation, starting at the still frame
   */
  spinningFrames: number;
  /**
   * The width of the frame
   */
  frameWidth: number;
  /**
   * The height of the frame
   */
  frameHeight: number;
  /**
   * The rate at which animations will play
   */
  frameRate: number;
}

export default class Key implements IKey {
  public scene: Level;

  public type: KeyType;

  public sprite?: Phaser.Physics.Arcade.Sprite;

  public depth = DEFAULT_DEPTH + 1;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  public carrier?: KeyCarrier;

  private x?: number;

  private y?: number;

  private name: string;

  private spritesheet: string;

  private stillAnimation: string;

  private stillFrame: number;

  private spinningFrames: number;

  private spinningAnimation: string;

  private frameWidth: number;

  private frameHeight: number;

  private frameRate: number;

  private isUsed = false;

  private lastFrame = 0;

  constructor(props: KeyProps) {
    this.scene = props.scene;
    this.type = props.type;
    if ((!props.x || !props.y) && (!props.carrier)) {
      throw new Error(
        'Need Either x & y or a carrier for the key to exist. '
        + `You provided X: ${props.x} Y: ${props.y} carrier: ${props.carrier}`,
      );
    }
    this.carrier = props.carrier;
    this.x = props.x;
    this.y = props.y;
    this.name = props.name;
    this.spritesheet = props.spritesheet;
    this.stillAnimation = `${this.name}Still`;
    this.stillFrame = props.stillFrame;
    this.spinningAnimation = `${this.name}Spinning`;
    this.spinningFrames = props.spinningFrames;
    this.frameWidth = props.frameWidth;
    this.frameHeight = props.frameHeight;
    this.frameRate = props.frameRate;
  }

  preload(): void {
    this.scene.load.spritesheet(
      this.name,
      imageLocationFor(this.spritesheet),
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
  }

  create(): void {
    this.x = this.carrier?.sprite?.x ?? this.x;
    this.y = this.carrier?.sprite?.y ?? this.y;
    this.sprite = this.scene.physics.add.sprite(this.x!, this.y!, this.name);
    this.sprite.depth = this.depth;
    this.scene.anims.create({
      key: this.stillAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.stillFrame,
        end: this.stillFrame,
      }),
    });
    this.scene.anims.create({
      key: this.spinningAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.stillFrame,
        end: this.spinningFrames - 1,
      }),
      frameRate: this.frameRate,
      repeat: -1,
      yoyo: true,
    });
  }

  createColliders(): void {
    this.scene.physics.add.collider(this.scene.ground!, this.sprite!);
    this.scene.physics.add.overlap(
      this.scene.player.sprite!,
      this.sprite!,
      () => {
        if (!this.carrier) {
          this.scene.player.addKey(this);
        }
      },
    );
  }

  setCarrier(carrier: KeyCarrier): void {
    this.carrier = carrier;
  }

  useKey(lock: ILock<this>) {
    if (lock.canUnlock(this)) {
      lock.unlock(this);
      this.isUsed = true;
      this.carrier = undefined;
    }
  }

  drop(): void {
    this.sprite!.setX(this.carrier!.sprite!.x);
    this.sprite!.setY(this.carrier!.sprite!.y);
    this.sprite!.setVisible(true);
    this.sprite!.setVelocityY(-30);
    this.carrier = undefined;
  }

  disableColliders(): void {
    this.colliders.forEach((collider) => {
      // eslint-disable-next-line no-param-reassign
      collider.active = false;
    });
  }

  update(): void {
    if (this.isUsed) {
      this.sprite!.setVisible(false);
      this.disableColliders();
    } else if (!this.carrier) {
      this.sprite!.anims.play(this.spinningAnimation, true);
      if (
        this.sprite!.anims.currentFrame.index === this.spinningFrames
        && this.lastFrame === this.spinningFrames - 1
      ) {
        this.sprite!.flipX = !this.sprite!.flipX;
      }
      this.lastFrame = this.sprite!.anims.currentFrame.index;
    } else if (!this.carrier!.isAlive) {
      this.drop();
    } else {
      this.sprite!.anims.play(this.stillAnimation, true);
      this.sprite!.setVisible(false);
      this.sprite!.setX(this.carrier!.sprite!.x);
      this.sprite!.setY(this.carrier!.sprite!.y);
      this.sprite!.setVelocity(0, 0);
      this.sprite!.setGravity(0, 0);
    }
  }
}
