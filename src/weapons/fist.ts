import Phaser from 'phaser';
import {
  Enemy,
  MeleeOnlyWeapon,
} from '../types';
import Player from '../characters/player';
import PlayerError from '../errors/player';
import { INFINITY, WEAPON_ICON_DIMENSIONS } from '../constants';

export default class Fist implements MeleeOnlyWeapon {
  public ammo = INFINITY;

  public sprite?: Phaser.Physics.Arcade.Sprite;

  public canFire = true;

  public canDrop = false;

  public isDropped = false;

  public isMelee = true;

  public isProjectile = false;

  public scene: Phaser.Scene;

  public player: Player;

  public meleeDamage = 10;

  public rateOfFire = 1;

  private spriteName = 'fist';

  private spriteSheet = `${this.spriteName}.png`;

  private frameCount = 6;

  private frameWidth = 24;

  private frameHeight = 20;

  private frameRate = 20;

  private isFired = false;

  private fireAnimationRight = `${this.spriteName}PunchRight`;

  private fireAnimationLeft = `${this.spriteName}PunchLeft`;

  private animationIndex = 0;

  public hitBoxWidth: number = this.frameWidth;

  public hitBoxHeight: number = this.frameHeight;

  public blowback = 300;

  public collider?: Phaser.Physics.Arcade.Collider;

  public icon?: Phaser.Physics.Arcade.Image;

  private iconName = `${this.spriteName}Icon`;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  public preload(): void {
    this.scene.load.spritesheet(
      this.spriteName,
      `assets/${this.spriteSheet}`,
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
    this.scene.load.spritesheet(
      this.iconName,
      `assets/${this.iconName}.png`,
      {
        frameWidth: WEAPON_ICON_DIMENSIONS.width,
        frameHeight: WEAPON_ICON_DIMENSIONS.height,
      },
    );
  }

  public create(): void {
    if (!(this.player.sprite)) {
      throw new PlayerError('Attempted to access player attributes before creation');
    }
    this.sprite = this.scene.physics.add.sprite(
      this.player.sprite.x,
      this.player.sprite.y,
      this.spriteName,
    );
    this.sprite.setGravityY(0);
    this.sprite.setVisible(false);
    this.scene.anims.create({
      key: this.fireAnimationRight,
      frames: this.scene.anims.generateFrameNumbers(this.spriteName, {
        start: 0,
        end: this.frameCount - 1,
      }),
      frameRate: this.frameRate,
      repeat: 0,
    });
    this.scene.anims.create({
      key: this.fireAnimationLeft,
      frames: this.scene.anims.generateFrameNumbers(this.spriteName, {
        start: this.frameCount,
        end: 2 * this.frameCount - 1,
      }),
      frameRate: this.frameRate,
      repeat: 0,
    });
    this.icon = this.scene.physics.add.staticImage(
      WEAPON_ICON_DIMENSIONS.x,
      WEAPON_ICON_DIMENSIONS.y,
      this.iconName,
    );
    this.displayIcon(false);
  }

  public interact(player: Player): void {
    // nonsense, just needed this method to exist
    this.isDropped = !player.isAlive;
  }

  public displayIcon(display: boolean): void {
    this.icon!.setVisible(display);
  }

  public update(): void {
    if (this.player.equippedWeapon === this) {
      if (!(this.player.sprite)) {
        throw new PlayerError('Attempted to access player attributes before creation');
      }
      this.sprite?.setVelocity(0, 0);
      const xOffset = (this.frameWidth / 2)
        + (
          (this.player.facingRight ? 1 : -1)
          * (this.frameWidth / 2)
        );
      const yOffset = this.frameHeight / 2;
      this.sprite?.setX(this.player.sprite.body.x + xOffset);
      this.sprite?.setY(this.player.sprite.body.y + yOffset);
      if (this.isFired) {
        this.setCollider(true);
        this.displayFist();
      } else {
        this.setCollider(false);
      }
    }
  }

  private setCollider(active: boolean) {
    if (this.collider?.active !== undefined) {
      this.collider.active = active;
    }
  }

  private reset(): void {
    this.sprite?.setVisible(false);
    this.isFired = false;
    setTimeout(() => { this.canFire = true; }, 500);
  }

  private displayFist() {
    this.animationIndex = (this.sprite?.anims.currentFrame?.index ?? -1 + 1) % this.frameCount;
    if (this.player.facingRight) {
      this.sprite?.anims.play(
        { key: this.fireAnimationRight, startFrame: this.animationIndex },
        true,
      );
    } else {
      this.sprite?.anims.play(
        { key: this.fireAnimationLeft, startFrame: this.animationIndex },
        true,
      );
    }
  }

  public fire(): void {
    if (this.canFire) {
      this.canFire = false;
      this.isFired = true;
      this.sprite?.setVisible(true);
      setTimeout(() => this.reset(), 250);
    }
  }

  public onHit(enemy: Enemy) {
    if (this.isFired && !enemy.isImmune(this)) {
      enemy.takeDamage(this.meleeDamage);
      if (this.sprite?.body.touching.left) {
        enemy.sprite?.setVelocityX(-1 * this.blowback);
      } else if (this.sprite?.body.touching.right) {
        enemy.sprite?.setVelocityX(this.blowback);
      }
      if (enemy.health <= 0) {
        enemy.die();
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  public reload(): void {}
}
