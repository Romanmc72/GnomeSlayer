import {
  Enemy,
  Weapon,
} from '../types';
import { ISpriteContainer, PartialSpriteContainerProps, SpriteContainer } from './spriteContainer';
import { DEFAULT_DEPTH } from '../constants';
import Player from '../characters/player';

/**
 * The interface defining properties for a projectile or bullet.
 */
export interface IProjectile extends ISpriteContainer {
  /**
   * The damage a projectile will deal when it hits an object.
   */
  damage: number;
  /**
   * Whether or not the projectile is still moving
   */
  isMoving: boolean;
  /**
   * The weapon from which this projectile is launched
   */
  weapon: Weapon;
  /**
   * The function to call when the projectile hits an object
   * @param object - The object the projectile has hit
   * @returns - Nothing.
   */
  hit: (object: Player | Enemy) => void;
  /**
   * The function to call when the projectile stops
   * @returns - Nothing.
   */
  stop: () => void;
  /**
   * Launches the projectile.
   */
  launch: (x: number, y: number, direction: number) => void;
}

export interface ProjectileProps extends Omit<PartialSpriteContainerProps, 'x' | 'y'> {
  /**
   * The amount of damage the projectile will do on collision with an object
   */
  damage: number;
  /**
   * The amount of gravity in effect on the projectile as it travels
   */
  gravity: number;
  /**
   * How far the projectile can go before it must stop
   */
  range: number;
  /**
   * The speed at which the projectile moves
   */
  velocity: number;
  /**
   * The weapon that launches this projectile
   */
  weapon: Weapon;
  /**
   * The number of frames involved in the animation of the projectile is launched
   */
  launchedFrames: number;
}

export class Projectile extends SpriteContainer implements IProjectile {
  public damage: number;

  public weapon: Weapon;

  public isMoving = false;

  private gravity: number;

  private range: number;

  private velocity: number;

  private origin_x = 0;

  private origin_y = 0;

  private direction = 0;

  constructor(props: ProjectileProps) {
    super({
      ...props,
      animationSettings: {
        launch: {
          frameStart: 0,
          frameEnd: props.launchedFrames - 1,
        },
      },
      depth: DEFAULT_DEPTH,
      x: 0,
      y: 0,
    });
    this.damage = props.damage;
    this.gravity = props.gravity;
    this.range = props.range;
    this.velocity = props.velocity;
    this.weapon = props.weapon;
  }

  launch(x: number, y: number, direction: number): void {
    this.origin_x = x;
    this.origin_y = y;
    this.direction = direction * this.velocity;
    this.sprite!.setX(this.origin_x);
    this.sprite!.setY(this.origin_y);
    this.sprite!.setVisible(true);
    this.isMoving = true;
    this.sprite!.setGravityY(this.gravity);
    this.sprite!.setVelocityX(this.direction);
    this.sprite!.anims.play(this.getAnimationName('launch'), true);
    if (this.weapon.player!.facingRight) {
      this.sprite!.flipX = false;
    } else {
      this.sprite!.flipX = true;
    }
  }

  hit(object: Player | Enemy): void {
    if (this.isMoving) {
      object.takeDamage(this.damage);
      if (object.health <= 0) {
        object.die();
      }
      this.stop();
    }
  }

  stop(): void {
    if (this.isMoving) {
      this.isMoving = false;
      this.disableColliders();
    }
  }

  createColliders(): void {
    this.scene.physics.add.collider(
      this.sprite!,
      this.scene.ground!,
      () => {
        this.stop();
      },
    );
    this.scene.gnomes.forEach((gnome) => {
      const collider = this.scene.physics.add.collider(
        gnome.sprite!,
        this.sprite!,
        () => {
          this.hit(gnome);
          if (gnome.health <= 0) {
            gnome.die();
          }
        },
      );
      this.colliders.push(collider);
      gnome.colliders.push(collider);
    });
  }

  /**
   * Gets the distance that this object has traveled since launching
   */
  private getDistanceTraveled(): number {
    const xDistance = Math.abs(this.origin_x - this.sprite!.x);
    const yDistance = Math.abs(this.origin_y - this.sprite!.y);
    const totalDistance = Math.sqrt(xDistance ** 2 + yDistance ** 2);
    return totalDistance;
  }

  update(): void {
    if (!this.isMoving) {
      this.sprite!.setVelocity(0, 0);
      this.sprite!.setGravity(0, 0);
      this.sprite!.setVisible(false);
    } else {
      this.sprite!.setVelocityY(this.gravity);
      this.sprite!.setVelocityX(this.direction);
      this.sprite!.setVisible(true);
      if (this.getDistanceTraveled() > this.range) {
        this.stop();
      }
    }
  }
}
