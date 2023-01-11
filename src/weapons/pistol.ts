import Phaser from 'phaser';
import Player from '../characters/player';
import { ProjectileOnlyWeapon } from '../types';
import { WEAPON_ICON_DIMENSIONS } from '../constants';
import SmallBullet from './smallBullet';

export interface PistolProps {
  scene: Phaser.Scene;
  player: Player;
  currentClip: number;
  ammo: number;
}

export default class Pistol implements ProjectileOnlyWeapon {
  public scene: Phaser.Scene;

  public player: Player;

  public projectile: SmallBullet;

  public ammo: number;

  public currentClip: number;

  public clipSize = 10;

  public meleeDamage = 0;

  public canFire: boolean;

  public canReload: boolean;

  public reloadTime = 2000;

  public rateOfFire = 2;

  public canDrop = true;

  public icon?: Phaser.Physics.Arcade.Image;

  public sprite?: Phaser.Physics.Arcade.Sprite;

  private imageName = 'pistol';

  private iconName = `${this.imageName}Icon`;

  private fireAnimation = `${this.imageName}Fire`;

  private loadedAnimation = `${this.imageName}Loaded`;

  private emptyAnimation = `${this.imageName}Empty`;

  private frameWidth = 10;

  private frameHeight = 7;

  private frameRate = 4;

  constructor(props: PistolProps) {
    this.scene = props.scene;
    this.player = props.player;
    this.ammo = props.ammo;
    this.projectile = new SmallBullet({
      scene: this.scene,
      x: 0,
      y: 0,
      direction: 0,
    });
    this.currentClip = props.currentClip;
    this.canFire = this.ammo > 0 && this.currentClip > 0;
    this.canReload = this.ammo > this.currentClip && this.clipSize > this.currentClip;
  }

  public fire(): void {
    if (this.canFire) {
      if (this.currentClip === 0) {
        this.canFire = false;
        this.reload();
        setTimeout(() => { this.canFire = true; }, this.reloadTime);
      } else {
        this.projectile.launch(
          this.player.sprite!.body.x,
          this.player.sprite!.body.y,
          this.player.facingRight ? 1 : -1,
        );
        this.ammo -= 1;
        this.currentClip -= 1;
        this.updateCanReload();
        this.canFire = false;
        setTimeout(() => { this.canFire = true; }, 1000 / this.rateOfFire);
      }
    }
  }

  private updateCanReload(): void {
    this.canReload = this.ammo > this.currentClip && this.clipSize > this.currentClip;
  }

  public reload(): void {
    this.updateCanReload();
    if (this.canReload) {
      this.currentClip = Math.min(this.ammo, this.clipSize);
      this.updateCanReload();
    }
  }

  public displayIcon(display: boolean): void {
    this.icon?.setVisible(display);
  }

  public preload(): void {
    this.scene.load.spritesheet(
      this.imageName,
      `assets/${this.imageName}.png`,
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
    this.scene.load.image(this.iconName, `assets/${this.iconName}.png`);
    this.projectile.preload();
  }

  public create(): void {
    this.icon = this.scene.physics.add.staticImage(
      WEAPON_ICON_DIMENSIONS.x,
      WEAPON_ICON_DIMENSIONS.y,
      this.iconName,
    );
    this.sprite = this.scene.physics.add.sprite(
      this.player.sprite!.x,
      this.player.sprite!.y,
      this.imageName,
    );
    this.scene.anims.create({
      key: this.fireAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.imageName, {
        start: 0,
        end: 3,
      }),
      frameRate: this.frameRate,
      repeat: 0,
      yoyo: true,
    });
    this.scene.anims.create({
      key: this.loadedAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.imageName, {
        start: 0,
        end: 0,
      }),
    });
    this.scene.anims.create({
      key: this.emptyAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.imageName, {
        start: 4,
        end: 4,
      }),
    });
    this.projectile.create();
  }

  public update(): void {
    if (this.player.equippedWeapon === this) {
      this.sprite?.setVisible(true);
      this.sprite?.setVelocity(0, 0);
      const xOffset = (this.frameWidth / 2)
        + (
          (this.player.facingRight ? 1 : -1)
          * (this.frameWidth / 2)
        );
      const yOffset = this.frameHeight / 2;
      this.sprite?.setX(this.player.sprite!.body.x + xOffset);
      this.sprite?.setY(this.player.sprite!.body.y + yOffset);
      if (this.canFire) {
        if (this.currentClip > 0) {
          this.sprite?.anims.play(this.loadedAnimation);
        } else {
          this.sprite?.anims.play(this.emptyAnimation);
        }
      } else if (this.currentClip > 0) {
        this.sprite?.anims.play(this.fireAnimation);
      } else {
        this.sprite?.anims.play(this.emptyAnimation);
      }
      if (this.player.facingRight) {
        this.sprite!.flipX = true;
      } else {
        this.sprite!.flipX = false;
      }
    } else {
      this.sprite?.setVisible(false);
    }
  }
}
