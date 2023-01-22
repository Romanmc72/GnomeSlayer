import Phaser from 'phaser';
import Player from '../characters/player';
import { DEFAULT_DEPTH } from '../constants';
import {
  Enemy,
  Level,
  Projectile,
  Weapon,
} from '../types';

export interface SmallBulletProps {
  scene: Level;
  weapon: Weapon;
}

export default class SmallBullet implements Projectile {
  public scene: Level;

  public depth = DEFAULT_DEPTH;

  public weapon: Weapon;

  public velocity = 600;

  public damage = 10;

  public range = 300;

  public direction = 0;

  public gravity = 0;

  public origin_x = 0;

  public origin_y = 0;

  public x = 0;

  public y = 0;

  public isMoving = false;

  private imageName = 'smallBullet';

  public sprite?: Phaser.Physics.Arcade.Sprite;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  constructor(props: SmallBulletProps) {
    this.scene = props.scene;
    this.weapon = props.weapon;
  }

  public launch(x: number, y: number, direction: number) {
    this.x = x;
    this.y = y;
    this.direction = direction * this.velocity;
    this.sprite!.setX(x);
    this.sprite!.setY(y);
    this.sprite!.setVisible(true);
    this.isMoving = true;
    this.sprite!.setGravityY(this.gravity);
    this.sprite!.setVelocityX(this.direction);
    if (this.weapon.player!.facingRight) {
      this.sprite!.flipX = false;
    } else {
      this.sprite!.flipX = true;
    }
  }

  public hit(object: Player | Enemy): void {
    if (this.isMoving) {
      object.takeDamage(this.damage);
      if (object.health <= 0) {
        object.die();
      }
      this.stop();
    }
  }

  public stop(): void {
    if (this.isMoving) {
      this.isMoving = false;
      this.colliders.forEach((collider) => {
        // eslint-disable-next-line no-param-reassign
        collider.active = false;
      });
    }
  }

  public preload(): void {
    this.scene.load.image(this.imageName, `assets/${this.imageName}.png`);
  }

  public create(): void {
    this.sprite = this.scene.physics.add.sprite(
      this.origin_x,
      this.origin_y,
      this.imageName,
    );
    this.sprite.depth = this.depth;
    this.sprite.setGravityY(0);
    this.sprite.setVelocity(0, 0);
    this.isMoving = false;
    this.sprite.setVisible(false);
  }

  public createColliders(): void {
    this.scene.physics.add.collider(
      this.sprite!,
      this.scene.ground!,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_o1, _o2) => {
        this.stop();
      },
    );
    this.scene.gnomes.forEach((gnome) => {
      const collider = this.scene.physics.add.collider(
        gnome.sprite!,
        this.sprite!,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_o1, _o2) => {
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

  public update(): void {
    if (!this.isMoving) {
      this.sprite!.setVelocity(0, 0);
      this.sprite!.setGravity(0, 0);
      this.sprite!.setVisible(false);
    } else {
      this.sprite!.setVelocityY(this.gravity);
      this.sprite!.setVelocityX(this.direction);
      this.sprite!.setVisible(true);
    }
  }
}
