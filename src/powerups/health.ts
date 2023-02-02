import { Enemy, IPowerUp, SpriteContainerProps } from '../types';
import { SpriteContainer } from '../generics';
import { DEFAULT_DEPTH } from '../constants';
import Player from '../characters/player';

export interface HealthProps extends Omit<SpriteContainerProps, 'animationSettings'> {
  /**
   * How much health that this object restores to a player
   */
  healthAmount: number;
  /**
   * How many frames are involved in the spinning animation
   */
  spinningFrames: number;
  /**
   * Whether or not the animation yoyo's
   */
  yoyo: boolean;
  /**
   * The enemy carrying the power up
   */
  carrier?: Enemy;
}

export default class Health extends SpriteContainer implements IPowerUp {
  public depth = DEFAULT_DEPTH + 10;

  public healthAmount: number;

  public isUsed = false;

  private carrier?: Enemy;

  public popUpHeight = 30;

  constructor(props: HealthProps) {
    super({
      animationSettings: {
        spinning: {
          frameStart: 0,
          frameEnd: props.spinningFrames - 1,
          yoyo: props.yoyo,
        },
      },
      ...props,
    });
    this.healthAmount = props.healthAmount;
    this.carrier = props.carrier;
  }

  createColliders(): void {
    this.scene.physics.add.collider(this.sprite!, this.scene.ground!);
    this.colliders.push(
      this.scene.physics.add.overlap(
        this.sprite!,
        this.scene.player.sprite!,
        () => {
          if (!this.carrier) {
            this.heal(this.scene.player);
          }
        },
      ),
    );
  }

  /**
   * Heal a player with this power up!
   * @param player - The player to heal
   */
  heal(player: Player): void {
    if (player.health < player.getMaxHealth()) {
      player.addHealth(this.healthAmount);
      this.isUsed = true;
      this.disableColliders();
    }
  }

  drop(): void {
    this.carrier = undefined;
    this.sprite!.setVelocityY(this.popUpHeight);
  }

  update(): void {
    if (this.carrier) {
      this.sprite!.setVisible(false);
      this.sprite!.setX(this.carrier.sprite!.x);
      this.sprite!.setY(this.carrier.sprite!.y);
      this.sprite!.setGravity(0, 0);
      this.sprite!.setVelocity(0, 0);
      if (!this.carrier.isAlive) {
        this.drop();
      }
    } else if (this.isUsed) {
      this.sprite!.setVisible(false);
    } else {
      this.sprite!.setVisible(true);
      this.sprite!.anims.play(this.getAnimationName('spinning'), true);
    }
  }
}
