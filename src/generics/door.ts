import { DEFAULT_DEPTH } from '../constants';
import {
  KeyType,
  ILock,
  PartialSpriteContainerProps,
} from '../types';
import { SpriteContainer } from './spriteContainer';
import { Lock } from './lock';

export const enum DoorState {
  OPEN = 'open',
  CLOSED = 'closed',
  LOCKED = 'locked',
  OPENING = 'opening',
}

/**
 * The properties for creating a door. It is inferred that the frames between
 * closed and open are the animation of the door opening. It is also inferred
 * that if there is a locked frame, the frames between the door as locked and
 * the door as closed are the animation of the door unlocking.
 */
export interface DoorProps extends PartialSpriteContainerProps {
  /**
   * The next scene that this door leads to
   */
  nextSceneName: string;
  /**
   * The x coordinate of the door
   */
  x: number;
  /**
   * The y coordinate of the door
   */
  y: number;
  /**
   * The state of the door at initialization
   */
  state: DoorState;
  /**
   * The number corresponding to the frame representing the door as
   * DoorState.OPEN
   */
  openFrame: number;
  /**
   * The number corresponding to the frame representing the door as
   * DoorState.CLOSED
   */
  closedFrame: number;
  /**
   * The type of lock on the door (if there is one)
   */
  lock?: ILock<KeyType>;
  /**
   * How long to wait before becoming interact-able between state changes
   */
  stateChangeTimer: number;
}

/**
 * A door which can be opened, closed, locked, or even hidden
 */
export class Door extends SpriteContainer {
  private nextSceneName: string;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  public depth = DEFAULT_DEPTH - 100;

  public state: DoorState;

  private lock?: ILock<KeyType>;

  private stateChangeTimer: number;

  private isChangingState = false;

  constructor(props: DoorProps) {
    super({
      ...props,
      animationSettings: {
        [DoorState.OPEN]: {
          frameStart: props.openFrame,
          frameEnd: props.openFrame,
        },
        [DoorState.CLOSED]: {
          frameStart: props.closedFrame,
          frameEnd: props.closedFrame,
        },
        [DoorState.OPENING]: {
          frameStart: props.closedFrame,
          frameEnd: props.openFrame,
          frameRate: props.frameRate,
          repeat: 0,
        },
      },
      depth: DEFAULT_DEPTH - 100,
    });
    this.nextSceneName = props.nextSceneName;
    this.state = props.state;
    this.lock = props.lock;
    this.stateChangeTimer = props.stateChangeTimer;
  }

  createColliders(): void {
    this.scene.physics.add.collider(this.scene.ground!, this.sprite!);
    this.colliders.push(
      this.scene.physics.add.overlap(
        this.sprite!,
        this.scene.player.sprite!,
        () => {
          if (this.scene.player.isInteracting) {
            this.interact();
          }
        },
      ),
    );
  }

  update(): void {
    if (!this.isChangingState) {
      switch (this.state) {
        case DoorState.OPEN:
          this.sprite!.play(this.getAnimationName(DoorState.OPEN), true);
          break;
        default:
          this.sprite!.play(this.getAnimationName(DoorState.CLOSED), true);
      }
    }
  }

  interact(): void {
    if (!this.isChangingState) {
      if (this.canUnlock()) {
        this.unlockDoor();
      } else if (this.state === DoorState.CLOSED) {
        this.openDoor();
        setTimeout(() => { this.closeDoor(); }, 6000);
      } else if (this.state === DoorState.OPEN) {
        // this.scene.scene.start(this.nextSceneName);
        this.scene.nextLevel(
          this.nextSceneName,
          { player: this.scene.player.getProps() },
        );
      }
    }
  }

  hide(hidden: boolean): void {
    this.sprite?.setVisible(hidden);
  }

  canUnlock(): boolean {
    return (
      this.state === DoorState.LOCKED
      && this.lock !== undefined
      && this.lock!.canUnlock()
    );
  }

  private resetIsChangingState(timeMS?: number): void {
    this.isChangingState = true;
    setTimeout(() => { this.isChangingState = false; }, timeMS ?? this.stateChangeTimer);
  }

  openDoor(): void {
    if (this.state === DoorState.CLOSED) {
      this.sprite!.anims.play(this.getAnimationName(DoorState.OPENING), true);
      this.sprite!.playAfterRepeat(this.getAnimationName(DoorState.OPEN));
      this.state = DoorState.OPEN;
      this.resetIsChangingState();
    }
  }

  closeDoor(): void {
    if (this.state === DoorState.OPEN) {
      this.sprite!.playReverse(this.getAnimationName(DoorState.OPENING), true);
      this.sprite!.playAfterRepeat(this.getAnimationName(DoorState.CLOSED));
      this.state = DoorState.CLOSED;
      this.resetIsChangingState();
    }
  }

  lockDoor(): void {
    if (this.lock) {
      if (this.state === DoorState.OPEN) {
        this.closeDoor();
        this.lockDoor();
      } else if (this.state === DoorState.CLOSED) {
        this.state = DoorState.LOCKED;
        this.lock!.lock();
        this.resetIsChangingState();
      }
    } else {
      this.closeDoor();
    }
  }

  unlockDoor(): void {
    if (this.state === DoorState.LOCKED) {
      this.lock!.unlock();
      this.state = DoorState.CLOSED;
      this.resetIsChangingState(this.lock!.getTransitionTime());
    }
  }

  setLock(lock: Lock<KeyType>) {
    this.lock = lock;
    this.lockDoor();
  }
}
