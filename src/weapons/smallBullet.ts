import Phaser from 'phaser';
import Player from '../characters/player';
import { Projectile } from '../types';
import Enemy from '../characters/enemy';

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

  constructor(props: SmallBulletProps) {
    this.scene = props.scene;
    this.origin_x = props.x;
    this.origin_y = props.y;
    this.x = this.origin_x;
    this.y = this.origin_y;
    this.direction = props.direction;
  }

  public hit(object: Player | Enemy): void {
    object.takeDamage(this.damage);
    this.stop();
  }

  public stop(): void {}

  public preload(): void {}

  public create(): void {}

  public update(): void {}

}
