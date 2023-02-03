import {
  IKey,
  KeyCarrier,
  KeyType,
  Level,
  SpriteContainerProps,
} from '../types';
import { DEFAULT_DEPTH } from '../constants';
import { SpriteContainer } from '../generics';

/**
 * The properties required to instantiate a key
 */
export interface KeyProps extends Omit<SpriteContainerProps, 'animationSettings' | 'depth'> {
  /**
   * The type of key belonging to a certain type of lock
   */
  type: KeyType;
  /**
   * The carrier of the key, this will override the x and y props if it is set
   * as the key's x and y will be set to that of the carrier.
   */
  carrier?: KeyCarrier;
  /**
   * The total number of frames in the spinning animation, starting at the still frame
   */
  spinningFrames: number;
}

export default class Key extends SpriteContainer implements IKey {
  public scene: Level;

  public type: KeyType;

  public carrier?: KeyCarrier;

  private isUsed = false;

  private lastFrame = 0;

  private spinningFrames: number;

  constructor(props: KeyProps) {
    super({
      ...props,
      animationSettings: {
        still: {
          frameStart: 0,
          frameEnd: 0,
        },
        spinning: {
          frameStart: 0,
          frameEnd: props.spinningFrames - 1,
          frameRate: props.frameRate,
          yoyo: true,
        },
      },
      depth: DEFAULT_DEPTH + 1,
    });
    this.scene = props.scene;
    this.type = props.type;
    this.carrier = props.carrier;
    this.spinningFrames = props.spinningFrames;
  }

  createColliders(): void {
    this.scene.physics.add.collider(this.scene.ground!, this.sprite!);
    this.colliders.push(
      this.scene.physics.add.overlap(
        this.scene.player.sprite!,
        this.sprite!,
        () => {
          if (!this.carrier && !this.isUsed) {
            this.scene.player.addKey(this);
          }
        },
      ),
    );
  }

  setCarrier(carrier: KeyCarrier): void {
    this.carrier = carrier;
  }

  useKey() {
    this.isUsed = true;
    this.carrier = undefined;
    this.disableColliders();
  }

  drop(): void {
    this.sprite!.setX(this.carrier!.sprite!.x);
    this.sprite!.setY(this.carrier!.sprite!.y);
    this.sprite!.setVisible(true);
    this.sprite!.setVelocityY(-30);
    this.carrier = undefined;
  }

  update(): void {
    if (this.isUsed) {
      this.sprite!.setVisible(false);
      this.disableColliders();
    } else if (!this.carrier) {
      this.sprite!.anims.play(this.getAnimationName('spinning'), true);
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
      this.sprite!.anims.play(this.getAnimationName('still'), true);
      this.sprite!.setVisible(false);
      this.sprite!.setX(this.carrier!.sprite!.x);
      this.sprite!.setY(this.carrier!.sprite!.y);
      this.sprite!.setVelocity(0, 0);
      this.sprite!.setGravity(0, 0);
    }
  }
}
