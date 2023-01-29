import Phaser from 'phaser';
import {
  IKey,
  KeyType,
  ILock,
  Level,
  SpriteContainerProps,
} from '../types';
import imageLocationFor from '../helpers';
import Door from './door';
import Player from '../characters/player';

/**
 * The properties required to instantiate a lock class
 */
export interface LockProps<T> extends SpriteContainerProps {
  /**
   * THe type of key that fits this lock
   */
  type: T;
  /**
   * Whether or not this lock initializes as locked
   */
  isLocked: boolean;
  /**
   * The frame number for the lock as unlocked. The locked frame is considered
   * to be the first frame and this will be the last frame. All frames in
   * between will be the animation for unlocking and the locking animation will
   * be the locking animation played in reverse.
   */
  unlockFrame: number;
  /**
   * The object that this lock is "Locking"
   */
  lockedObject: Door;
}

export default class Lock<T extends KeyType> implements ILock<T> {
  public scene: Level;

  public type: T;

  public isLocked: boolean;

  public sprite?: Phaser.Physics.Arcade.Sprite;

  public depth: number;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  private name: string;

  private spritesheet: string;

  private lockedAnimation: string;

  private unlockingAnimation: string;

  private unlockedAnimation: string;

  private lockFrame = 0;

  private unlockFrame: number;

  private frameWidth: number;

  private frameHeight: number;

  private frameRate: number;

  private lockedObject: Door;

  private transitioning = false;

  private transitionTime = 2500;

  constructor(props: LockProps<T>) {
    this.scene = props.scene;
    this.type = props.type;
    this.isLocked = props.isLocked;
    this.name = props.name;
    this.spritesheet = props.spritesheet;
    this.unlockFrame = props.unlockFrame;
    this.lockedAnimation = `${this.name}Locked`;
    this.unlockedAnimation = `${this.name}Unlocked`;
    this.unlockingAnimation = `${this.name}Unlocking`;
    this.unlockFrame = props.unlockFrame;
    this.frameWidth = props.frameWidth;
    this.frameHeight = props.frameHeight;
    this.frameRate = props.frameRate;
    this.lockedObject = props.lockedObject;
    this.lockedObject.setLock(this);
    this.depth = this.lockedObject.depth + 1;
  }

  lock(): void {
    this.isLocked = true;
    this.transitioning = true;
    this.sprite?.anims.playReverse(this.unlockingAnimation, true);
    setTimeout(() => { this.transitioning = false; }, this.transitionTime);
  }

  unlock(player: Player): void {
    if (this.canUnlock(player) && this.isLocked) {
      const key = player.keys[this.type].pop();
      if (key === undefined) {
        return;
      }
      this.isLocked = false;
      this.transitioning = true;
      this.sprite!.anims.play(this.unlockingAnimation);
      setTimeout(() => { this.transitioning = false; }, this.transitionTime);
    }
  }

  canUnlock(player: Player): boolean {
    return (player.keys[this.type].length > 0);
  }

  preload(): void {
    this.scene.load.spritesheet(
      this.name,
      imageLocationFor(this.spritesheet),
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
  }

  create(): void {
    this.sprite = this.scene.physics.add.sprite(
      this.lockedObject.sprite!.x,
      this.lockedObject.sprite!.y,
      this.name,
    );
    this.sprite.setDepth(this.depth);
    this.scene.anims.create({
      key: this.lockedAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.lockFrame,
        end: this.lockFrame,
      }),
    });
    this.scene.anims.create({
      key: this.unlockedAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.unlockFrame,
        end: this.unlockFrame,
      }),
    });
    this.scene.anims.create({
      key: this.unlockingAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.lockFrame,
        end: this.unlockFrame,
      }),
      frameRate: this.frameRate,
      repeat: 0,
    });
  }

  createColliders(): void {
    this.colliders.push(
      this.scene.physics.add.overlap(
        this.sprite!,
        this.scene.player.sprite!,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_o1, _o2) => {
          if (this.scene.player.isInteracting && this.isLocked) {
            if (this.canUnlock(this.scene.player)) {
              this.unlock(this.scene.player);
            }
            // if (this.scene.player.keys[this.type].length > 0) {
            //   this.unlock(this.scene.player.keys[this.type].pop()!);
            // }
          }
        },
      ),
    );
  }

  update(): void {
    this.sprite!.setX(this.lockedObject.sprite!.x);
    this.sprite!.setY(this.lockedObject.sprite!.y);
    this.sprite!.setGravity(0, 0);
    this.sprite!.setVelocity(0, 0);
    if (!this.transitioning) {
      if (this.isLocked) {
        this.sprite?.anims.play(this.lockedAnimation, true);
      } else {
        this.sprite?.anims.play(this.unlockedAnimation, true);
      }
    }
  }
}
