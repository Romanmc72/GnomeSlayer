import Phaser from 'phaser';
import Player from '../characters/player';
import { Enemy, Weapon } from '../types';
import { WEAPON_ICON_DIMENSIONS } from '../constants';

export interface PistolProps {
  scene: Phaser.Scene;
  player: Player;
  ammo: number;
}

export default class Pistol implements Weapon {
  public scene: Phaser.Scene;

  public player: Player;

  public ammo: number;

  public meleeDamage = 0;

  public canFire: boolean;

  public rateOfFire = 2;

  public canDrop = true;

  public icon?: Phaser.Physics.Arcade.Image;

  constructor(props: PistolProps) {
    this.scene = props.scene;
    this.player = props.player;
    this.ammo = props.ammo;
    this.canFire = this.ammo > 0;
  }

  public fire(): void {}

  public displayIcon(display: boolean): void {}

  public onHit(enemy: Enemy): void {}

  public preload(): void {}

  public create(): void {}

  public update(): void {}
}
