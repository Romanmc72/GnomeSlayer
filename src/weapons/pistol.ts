import Phaser from 'phaser';
import Player from '../characters/player';
import { ProjectileOnlyWeapon } from '../types';
import { WEAPON_ICON_DIMENSIONS } from '../constants';
import SmallBullet, { SmallBulletProps } from './smallBullet';
import Clip from './clip';
import { Level } from '../scenes/Level1';

/**
 * The properties required to instantiate a pistol
 */
export interface PistolProps {
  /**
   * The scene that the pistol will exist in
   */
  scene: Level;
  /**
   * The player that the pistol belongs to
   */
  player: Player;
  /**
   * The amount of ammo in the current clip
   */
  currentClip: number;
  /**
   * The amount of ammo available to reload that is not currently in the clip
   */
  ammo: number;
}

/**
 * The Pistol weapon, a variant of projectile only weapons. It fires the
 * {@link SmallBullet}
 */
export default class Pistol implements ProjectileOnlyWeapon<SmallBullet> {
  public projectile: SmallBullet;

  public scene: Level;

  public player: Player;

  public ammo: SmallBullet[];

  public currentClip: Clip<SmallBullet>;

  public clipSize = 10;

  public meleeDamage = 0;

  public canFire: boolean;

  public canReload: boolean;

  public reloadTime = 2000;

  public rateOfFire = 2;

  public canDrop = true;

  public isMelee = false;

  public isProjectile = true;

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

  private firedBullets: SmallBullet[] = [];

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  /**
   * Constructor for the pistol
   * @param props The {@link PistolProps}
   */
  constructor(props: PistolProps) {
    this.scene = props.scene;
    const bulletProps: SmallBulletProps = {
      scene: this.scene,
      weapon: this,
    };
    this.projectile = new SmallBullet(bulletProps);
    this.player = props.player;
    this.ammo = [];
    for (let eachBullet = 0; eachBullet < props.ammo; eachBullet += 1) {
      this.ammo.push(new SmallBullet(bulletProps));
    }
    this.currentClip = new Clip();
    for (let eachBullet = 0; eachBullet < props.currentClip; eachBullet += 1) {
      this.currentClip.addProjectile(new SmallBullet(bulletProps));
    }
    this.canFire = this.ammo.length > 0 && !this.currentClip.isEmpty();
    this.canReload = this.ammo.length > 0 && this.clipSize > this.currentClip.ammo.length;
  }

  public fire(): void {
    if (this.canFire) {
      if (this.currentClip.isEmpty()) {
        this.canFire = false;
        this.reload();
        setTimeout(() => { this.canFire = true; }, this.reloadTime);
      } else {
        const bullet = this.currentClip.fire();
        if (bullet) {
          const x = this.player.facingRight
            ? this.player.sprite!.body.x + this.player.frameWidth
            : this.player.sprite!.body.x;
          const y = this.player.sprite!.body.y + this.player.frameHeight / 2;
          bullet.launch(
            x,
            y,
            this.player.facingRight ? 1 : -1,
          );
          this.firedBullets.push(bullet);
        }
        this.updateCanReload();
        this.canFire = false;
        setTimeout(() => { this.canFire = true; }, 1000 / this.rateOfFire);
      }
    }
  }

  private updateCanReload(): void {
    this.canReload = this.ammo.length > 0 && this.clipSize > this.currentClip.ammo.length;
  }

  public reload(): void {
    this.updateCanReload();
    if (this.canReload) {
      const bulletsToReload = Math.min(
        this.clipSize - this.currentClip.ammo.length,
        this.ammo.length,
      );
      for (let eachBullet = 0; eachBullet < bulletsToReload; eachBullet += 1) {
        const bullet = this.ammo.pop();
        if (bullet) {
          this.currentClip.addProjectile(bullet);
        }
      }
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
    this.sprite.setGravityY(0);
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
    this.ammo.forEach((bullet) => {
      bullet.create();
    });
    this.currentClip.ammo.forEach((bullet) => {
      bullet.create();
    });
  }

  public update(): void {
    if (this.player.equippedWeapon === this) {
      this.sprite!.setVisible(true);
      this.sprite!.setVelocity(0, 0);
      const xOffset = (this.frameWidth / 2)
        + (
          (this.player.facingRight ? 1 : -1)
          * (this.frameWidth / 2)
        );
      const yOffset = this.frameHeight / 2;
      this.sprite!.setX(this.player.sprite!.body.x + xOffset);
      this.sprite!.setY(this.player.sprite!.body.y + yOffset);
      if (this.canFire) {
        if (!this.currentClip.isEmpty()) {
          this.sprite?.anims.play(this.loadedAnimation);
        } else {
          this.sprite?.anims.play(this.emptyAnimation);
        }
      } else if (!this.currentClip.isEmpty()) {
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
    this.ammo.forEach((bullet) => bullet.update());
    this.firedBullets.forEach((bullet) => bullet.update());
    this.currentClip.update();
  }
}
