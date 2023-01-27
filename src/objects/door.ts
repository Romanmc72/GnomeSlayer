import Player from '../characters/player';
import { DEFAULT_DEPTH } from '../constants';
import imagesLocationFor from '../helpers';
import { IKey, Level, ILock } from '../types';
import { SpriteContainer } from '../types/spriteContainer';

export enum DoorState {
  OPEN,
  CLOSED,
  LOCKED,
}

/**
 * The properties for creating a door. It is inferred that the frames between
 * closed and open are the animation of the door opening. It is also inferred
 * that if there is a locked frame, the frames between the door as locked and
 * the door as closed are the animation of the door unlocking.
 */
export interface DoorProps {
  /**
   * The scene inside of which this door exists
   */
  scene: Level;
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
   * The location of the spritesheet
   */
  spriteSheet: string;
  /**
   * The name of this particular door's animation key
   */
  name: string;
  /**
   * The frame width
   */
  frameWidth: number;
  /**
   * The frame height
   */
  frameHeight: number;
  /**
   * The rate at which the animation frames will play
   */
  frameRate: number;
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
   * The number corresponding to the frame representing the door as
   * DoorState.LOCKED
   */
  lockedFrame?: number;
  /**
   * The type of lock on the door (if there is one)
   */
  lock?: ILock<IKey>;
  /**
   * How long to wait before becoming interact-able between state changes
   */
  stateChangeTimer: number;
}

/**
 * A door which can be opened, closed, locked, or even hidden
 */
export default class Door implements SpriteContainer {
  public scene: Level;

  private nextSceneName: string;

  public sprite?: Phaser.Physics.Arcade.Sprite;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  private x: number;

  private y: number;

  public depth = DEFAULT_DEPTH - 100;

  public state: DoorState;

  private spriteSheet: string;

  private name: string;

  private frameWidth: number;

  private frameHeight: number;

  private frameRate: number;

  private openFrame: number;

  private openAnimation: string;

  private openingAnimation: string;

  private closedFrame: number;

  private closedAnimation: string;

  private lock?: ILock<IKey>;

  private lockedFrame?: number;

  private lockedAnimation: string;

  private unlockingAnimation: string;

  private stateChangeTimer: number;

  private isChangingState = false;

  constructor(props: DoorProps) {
    this.scene = props.scene;
    this.nextSceneName = props.nextSceneName;
    this.x = props.x;
    this.y = props.y;
    this.state = props.state;
    this.spriteSheet = props.spriteSheet;
    this.name = props.name;
    this.frameWidth = props.frameWidth;
    this.frameHeight = props.frameHeight;
    this.frameRate = props.frameRate;
    this.openFrame = props.openFrame;
    this.closedFrame = props.closedFrame;
    this.lock = props.lock;
    this.lockedFrame = props.lockedFrame;
    this.openAnimation = `${this.name}Open`;
    this.openingAnimation = `${this.name}Opening`;
    this.closedAnimation = `${this.name}Closed`;
    this.lockedAnimation = `${this.name}Locked`;
    this.unlockingAnimation = `${this.name}Unlocking`;
    this.stateChangeTimer = props.stateChangeTimer;
  }

  preload(): void {
    this.scene.load.spritesheet(
      this.name,
      imagesLocationFor(this.spriteSheet),
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
  }

  create(): void {
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, this.name);
    this.sprite.depth = this.depth;
    this.scene.anims.create({
      key: this.openAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.openFrame,
        end: this.openFrame,
      }),
    });
    this.scene.anims.create({
      key: this.closedAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.closedFrame,
        end: this.closedFrame,
      }),
    });
    this.scene.anims.create({
      key: this.openingAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.name, {
        start: this.closedFrame,
        end: this.openFrame,
      }),
      frameRate: this.frameRate,
      repeat: 0,
    });
    if (this.lockedFrame) {
      this.scene.anims.create({
        key: this.lockedAnimation,
        frames: this.scene.anims.generateFrameNumbers(this.name, {
          start: this.lockedFrame,
          end: this.lockedFrame,
        }),
      });
      this.scene.anims.create({
        key: this.unlockingAnimation,
        frames: this.scene.anims.generateFrameNumbers(this.name, {
          start: this.lockedFrame,
          end: this.closedFrame,
        }),
        frameRate: this.frameRate,
        repeat: 0,
      });
    }
  }

  createColliders(): void {
    this.scene.physics.add.collider(this.scene.ground!, this.sprite!);
    this.colliders.push(
      this.scene.physics.add.overlap(
        this.sprite!,
        this.scene.player.sprite!,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_o1, _o2) => {
          if (this.scene.player.isInteracting) {
            this.interact(this.scene.player);
          }
        },
      ),
    );
  }

  update(): void {
    if (!this.isChangingState) {
      switch (this.state) {
        case DoorState.OPEN:
          this.sprite!.play(this.openAnimation, true);
          break;
        case DoorState.LOCKED:
          this.sprite!.play(this.lockedAnimation, true);
          break;
        default:
          this.sprite!.play(this.closedAnimation, true);
      }
    }
  }

  interact(player: Player): void {
    if (!this.isChangingState) {
      if (this.state === DoorState.LOCKED && this.canUnlock(player)) {
        this.unlockDoor();
      } else if (this.state === DoorState.CLOSED) {
        this.openDoor();
        setTimeout(() => { this.closeDoor(); }, 6000);
      } else if (this.state === DoorState.OPEN) {
        this.scene.scene.start(this.nextSceneName);
      }
    }
  }

  hide(hidden: boolean): void {
    this.sprite?.setVisible(hidden);
  }

  // TODO : Deal with duplicate locking behavior
  canUnlock(player: Player): boolean {
    for (let keyNum = 0; keyNum < player.keys.length; keyNum += 1) {
      if (this.lock?.canUnlock(player.keys[keyNum])) {
        return true;
      }
    }
    return false;
  }

  private resetIsChangingState(): void {
    this.isChangingState = true;
    setTimeout(() => { this.isChangingState = false; }, this.stateChangeTimer);
  }

  openDoor(): void {
    if (this.state === DoorState.CLOSED) {
      this.sprite!.anims.play(this.openingAnimation, true);
      this.sprite!.playAfterRepeat(this.openAnimation);
      this.state = DoorState.OPEN;
      this.resetIsChangingState();
    }
  }

  closeDoor(): void {
    if (this.state === DoorState.OPEN) {
      this.sprite!.playReverse(this.openingAnimation, true);
      this.sprite!.playAfterRepeat(this.closedAnimation);
      this.state = DoorState.CLOSED;
      this.resetIsChangingState();
    }
  }

  lockDoor(): void {
    if (this.lockedFrame) {
      if (this.state === DoorState.OPEN) {
        this.closeDoor();
        this.lockDoor();
      } else if (this.state === DoorState.CLOSED) {
        this.sprite!.playReverse(this.unlockingAnimation, true);
        this.sprite!.playAfterRepeat(this.lockedAnimation);
        this.state = DoorState.LOCKED;
        this.resetIsChangingState();
      }
    }
  }

  unlockDoor(): void {
    if (this.lockedFrame && this.state === DoorState.LOCKED) {
      this.sprite!.play(this.unlockingAnimation, true);
      this.sprite!.playAfterRepeat(this.closedAnimation);
      this.state = DoorState.CLOSED;
      this.resetIsChangingState();
    }
  }
}
