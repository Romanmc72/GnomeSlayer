import {
  KeyType,
  ILock,
  PartialSpriteContainerProps,
} from '../types';
import { Door } from './door';
import { SpriteContainer } from './spriteContainer';

/**
 * The animations that a lock can play
 */
export enum LockAnimations {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  UNLOCKING = 'unlocking',
}

/**
 * The properties required to instantiate a lock class
 */
export interface LockProps<T> extends Omit<PartialSpriteContainerProps, 'x' | 'y'> {
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

export class Lock<T extends KeyType> extends SpriteContainer implements ILock<T> {
  public type: T;

  public isLocked: boolean;

  private lockedObject: Door;

  private transitioning = false;

  private transitionTime = 1000;

  constructor(props: LockProps<T>) {
    super({
      ...props,
      animationSettings: {
        [LockAnimations.LOCKED]: {
          frameStart: 0,
          frameEnd: 0,
        },
        [LockAnimations.UNLOCKED]: {
          frameStart: props.unlockFrame,
          frameEnd: props.unlockFrame,
        },
        [LockAnimations.UNLOCKING]: {
          frameStart: 0,
          frameEnd: props.unlockFrame,
          frameRate: props.frameRate,
          repeat: 0,
        },
      },
      depth: props.lockedObject.depth + 1,
      x: 0,
      y: 0,
    });
    this.type = props.type;
    this.isLocked = props.isLocked;
    this.lockedObject = props.lockedObject;
    this.lockedObject.setLock(this);
  }

  lock(): void {
    this.isLocked = true;
    this.transitioning = true;
    this.sprite?.anims.playReverse(this.getAnimationName(LockAnimations.UNLOCKING), true);
    setTimeout(() => { this.transitioning = false; }, this.transitionTime);
  }

  unlock(): void {
    if (this.canUnlock()) {
      const key = this.scene.player.getKey(this.type);
      if (key === undefined) {
        return;
      }
      key.useKey();
      this.isLocked = false;
      this.transitioning = true;
      this.sprite!.anims.play(this.getAnimationName(LockAnimations.UNLOCKING));
      setTimeout(() => { this.transitioning = false; }, this.transitionTime);
    }
  }

  canUnlock(): boolean {
    return (this.scene.player.hasKey(this.type) && this.isLocked);
  }

  getTransitionTime(): number {
    return this.transitionTime;
  }

  createColliders(): void {
    this.colliders.push(
      this.scene.physics.add.overlap(
        this.sprite!,
        this.scene.player.sprite!,
        () => {
          if (this.scene.player.isInteracting && this.canUnlock()) {
            this.unlock();
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
        this.sprite?.anims.play(this.getAnimationName(LockAnimations.LOCKED), true);
      } else {
        this.sprite?.anims.play(this.getAnimationName(LockAnimations.UNLOCKED), true);
      }
    }
  }
}
