import { Enemy } from '../../types';
import { IWeapon, WeaponBase, WeaponBaseProps } from './weaponBase';

/**
 * For weapons whose only means of damage is melee attack
 */
export interface IMeleeOnlyWeapon extends IWeapon {
  /**
   * How much melee damage this weapon does
   */
  meleeDamage: number;
  /**
   * An optional collider object if this weapon detects collisions
   */
  collider?: Phaser.Physics.Arcade.Collider;
  /**
   * The method to call when the weapon collides with an enemy
   * @param enemy - The enemy to collide with on Melee
   * @returns Nothing
   */
  onHit: (enemy: Enemy) => void;
}

/**
 * The animation states for a melee only weapon
 */
export enum MeleeOnlyWeaponAnimations {
  IDLE = 'idle',
  FIRE = 'fire',
  STILL = 'still'
}

/**
 * The properties required to instantiate the melee only weapon
 */
export interface MeleeOnlyWeaponProps extends Omit<
  WeaponBaseProps,
  'animationSettings'
  | 'isMelee'
  | 'isProjectile'
> {
  /**
   * The amount of damage that the melee weapon does
   */
  meleeDamage: number;
  /**
   * The amount of blowback an enemy will experience when hit
   */
  blowback: number;
  /**
   * The number of frames for the weapon to be idle. These should start at the
   * first frame and extend to the number of frames specified here beyond that.
   */
  idleFrames: number;
  /**
   * The number of frames involved in the animation of this weapon being fired.
   * These will start after the idle frames and extend the number of frames
   * specified.
   */
  fireFrames: number;
}

export class MeleeOnlyWeapon extends WeaponBase implements IMeleeOnlyWeapon {
  public meleeDamage: number;

  private isFired = false;

  private blowback: number;

  constructor(props: MeleeOnlyWeaponProps) {
    super({
      ...props,
      animationSettings: {
        [MeleeOnlyWeaponAnimations.STILL]: {
          frameStart: 0,
          frameEnd: 0,
          frameRate: props.frameRate,
        },
        [MeleeOnlyWeaponAnimations.IDLE]: {
          frameStart: 0,
          frameEnd: props.idleFrames - 1,
          frameRate: props.frameRate,
          yoyo: true,
        },
        [MeleeOnlyWeaponAnimations.FIRE]: {
          frameStart: props.idleFrames,
          frameEnd: props.idleFrames + props.fireFrames - 1,
          frameRate: props.frameRate,
        },
      },
      isMelee: true,
      isProjectile: false,
    });
    this.meleeDamage = props.meleeDamage;
    this.blowback = props.blowback;
  }

  createColliders(): void {
    this.scene.gnomes.forEach((gnome) => {
      const collider = this.scene.physics.add.overlap(
        gnome.sprite!,
        this.sprite!,
        () => {
          this.onHit(gnome);
          if (gnome.health <= 0) {
            gnome.die();
          }
        },
      );
      this.colliders.push(collider);
      gnome.colliders.push(collider);
    });
    this.colliders.push(
      this.scene.physics.add.overlap(
        this.scene.player.sprite!,
        this.sprite!,
        () => {
          if (this.scene.player.isInteracting && this.isDropped) {
            this.interact();
          }
        },
      ),
    );
  }

  interact(): void {
    if (this.isDropped) {
      this.scene.player.addWeapon(this);
      this.isDropped = false;
    }
  }

  /**
   * As of now, melee weapons have no reloading so this will do nothing
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  reload(): void {}

  onHit(enemy: Enemy): void {
    if (this.isFired && !enemy.isImmune(this)) {
      enemy.takeDamage(this.meleeDamage);
      if (this.sprite?.body.touching.left) {
        enemy.sprite?.setVelocityX(-1 * this.blowback);
      } else if (this.sprite?.body.touching.right) {
        enemy.sprite?.setVelocityX(this.blowback);
      }
    }
  }

  fire(): void {
    if (this.canFire) {
      this.canFire = false;
      this.isFired = true;
      this.sprite?.setVisible(true);
      this.reset();
    }
  }

  reset(): void {
    setTimeout(
      () => {
        this.isFired = false;
        this.canFire = true;
      },
      1000 * this.rateOfFire,
    );
  }

  update(): void {
    if (this.player) {
      if (this.player.equippedWeapon === this) {
        this.sprite!.setVisible(true);
        this.sprite?.setVelocity(0, 0);
        const xOffset = (this.frameWidth / 2)
          + (
            (this.player.facingRight ? 1 : -1)
            * (this.frameWidth / 2)
          );
        const yOffset = this.frameHeight / 2;
        this.sprite?.setX(this.player.sprite!.body.x + xOffset);
        this.sprite?.setY(this.player.sprite!.body.y + yOffset);
        if (this.isFired) {
          this.sprite!.anims.play(this.getAnimationName(MeleeOnlyWeaponAnimations.FIRE), true);
        } else {
          this.sprite!.anims.play(this.getAnimationName(MeleeOnlyWeaponAnimations.IDLE), true);
        }
        if (this.player.facingRight) {
          this.sprite!.flipX = false;
        } else {
          this.sprite!.flipX = true;
        }
      } else {
        this.sprite!.setVisible(false);
      }
    } else {
      this.isDropped = true;
      this.sprite?.setVisible(true);
      this.sprite?.setGravityY(30);
      this.sprite!.anims.play(this.getAnimationName(MeleeOnlyWeaponAnimations.STILL), true);
    }
  }
}
