import Phaser from 'phaser';
import Player from '../characters/player';
import { Level } from '../scenes/Level1';
import { Enemy, Projectile, Weapon } from '../types';

export interface SmallBulletProps {
  scene: Level;
  weapon: Weapon;
}

export default class SmallBullet implements Projectile {
  public scene: Level;

  public weapon: Weapon;

  public velocity = 600;

  public damage = 10;

  public range = 1000;

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
    this.sprite!.setX(x);
    this.sprite!.setY(y);
    this.sprite!.setVisible(true);
    this.isMoving = true;
    this.sprite!.setGravityY(this.gravity);
    this.sprite!.setVelocityX(direction * this.velocity);
    if (this.weapon.player.facingRight) {
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
    this.isMoving = false;
    this.colliders.forEach((collider) => {
      // eslint-disable-next-line no-param-reassign
      collider.active = false;
    });
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
    this.sprite.setGravityY(0);
    this.sprite.setVelocity(0, 0);
    this.isMoving = false;
    this.sprite.setVisible(false);
    this.scene.physics.add.collider(
      this.sprite!,
      this.scene.ground!,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_o1, _o2) => {
        this.stop();
        // this.sprite?.setVelocityX(0);
      },
    );
  }

  public update(): void {
    if (!this.isMoving) {
      this.sprite!.setVelocity(0, 0);
      this.sprite!.setGravity(0, 0);
      this.sprite!.setVisible(false);
    }
  }
}
