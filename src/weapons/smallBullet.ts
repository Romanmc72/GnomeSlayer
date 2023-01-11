import Phaser from 'phaser';
import Player from '../characters/player';
import { Enemy, Projectile } from '../types';

export interface SmallBulletProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
  direction: number;
}

export default class SmallBullet implements Projectile {
  public scene: Phaser.Scene;

  public velocity = 600;

  public damage = 10;

  public range = 1000;

  public direction: number;

  public gravity = 0;

  public origin_x: number;

  public origin_y: number;

  public x: number;

  public y: number;

  public isMoving = false;

  private imageName = 'smallBullet';

  public sprite?: Phaser.Physics.Arcade.Sprite;

  constructor(props: SmallBulletProps) {
    this.scene = props.scene;
    this.origin_x = props.x;
    this.origin_y = props.y;
    this.x = this.origin_x;
    this.y = this.origin_y;
    this.direction = props.direction;
  }

  public launch(x: number, y: number, direction: number) {
    this.origin_x = x;
    this.origin_y = y;
    this.create();
    this.sprite!.setVisible(true);
    this.isMoving = true;
    this.sprite!.setGravityY(this.gravity);
    this.sprite!.setVelocityX(direction * this.velocity);
  }

  public hit(object: Player | Enemy): void {
    object.takeDamage(this.damage);
    this.stop();
  }

  public stop(): void {
    this.isMoving = false;
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
    this.isMoving = false;
    this.sprite.setVisible(false);
  }

  public update(): void {
    this.sprite?.setGravity(0, 0);
    if (!this.isMoving) {
      this.sprite!.setVisible(false);
      this.sprite!.destroy();
    }
  }
}
