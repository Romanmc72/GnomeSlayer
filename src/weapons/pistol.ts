import Phaser from 'phaser';
import Player from '../characters/player';
import { ILevel } from '../types';
import { DEFAULT_DEPTH, WEAPON_ICON_DIMENSIONS } from '../constants';
import SmallBullet, { SmallBulletProps } from './smallBullet';
import Clip from './clip';
import { IProjectileOnlyWeapon } from '../generics';

/**
 * The properties required to instantiate a pistol
 */
export interface PistolProps {
  /**
   * The scene that the pistol will exist in
   */
  scene: ILevel;
  /**
   * The player that the pistol belongs to
   */
  player?: Player;
  /**
   * The amount of ammo in the current clip
   */
  currentClip: number;
  /**
   * The amount of ammo available to reload that is not currently in the clip
   */
  ammo: number;
  /**
   * The x coordinate to spawn the weapon at, if not carried by a player
   */
  x?: number;
  /**
   * The y coordinate to spawn the weapon at, if not carried by a player
   */
  y?: number;
}

/**
 * The Pistol weapon, a variant of projectile only weapons. It fires the
 * {@link SmallBullet}
 */
export default class Pistol implements IProjectileOnlyWeapon<SmallBullet> {
  public projectile: SmallBullet;

  public scene: ILevel;

  public player?: Player;

  public x?: number;

  public y?: number;

  public depth = DEFAULT_DEPTH;

  public ammo: SmallBullet[];

  public currentClip: Clip<SmallBullet>;

  public clipSize = 10;

  public meleeDamage = 0;

  public canFire: boolean;

  public isFiring = false;

  public canReload: boolean;

  public reloadTime = 2000;

  public isReloading = false;

  public rateOfFire = 2;

  public canDrop = true;

  public isDropped: boolean;

  public isMelee = false;

  public isProjectile = true;

  public icon?: Phaser.Physics.Arcade.Image;

  public sprite?: Phaser.Physics.Arcade.Sprite;

  public blast?: Phaser.Physics.Arcade.Sprite;

  private imageName = 'pistol';

  private iconName = `${this.imageName}Icon`;

  private fireAnimation = `${this.imageName}Firing`;

  private fireBlast = `${this.imageName}Fire`;

  private fireBlastAnimation = `${this.imageName}FireBlast`;

  private loadedAnimation = `${this.imageName}Loaded`;

  private emptyAnimation = `${this.imageName}Empty`;

  private frameWidth = 29;

  private frameHeight = 20;

  private fireFrames = 4;

  private fireBlastFrameWidth = 17;

  private fireBlastFrames = 7;

  private frameRate = 16;

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
    this.x = props.x;
    this.y = props.y;
    if (this.player) {
      this.isDropped = false;
    } else {
      this.isDropped = true;
    }
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
    if (this.canFire && !this.isReloading) {
      if (this.currentClip.isEmpty()) {
        this.reload();
      } else {
        this.isFiring = true;
        this.blast?.setVisible(true);
        const bullet = this.currentClip.fire();
        if (bullet) {
          const x = this.player!.facingRight
            ? this.player!.sprite!.body.x + this.player!.frameWidth + this.frameWidth - 10
            : this.player!.sprite!.body.x - this.frameWidth + 10;
          const y = this.player!.sprite!.body.y + this.player!.frameHeight / 2;
          bullet.launch(
            x,
            y,
            this.player!.facingRight ? 1 : -1,
          );
          this.firedBullets.push(bullet);
        }
        this.updateCanReload();
        this.canFire = false;
        setTimeout(() => {
          this.isFiring = false;
          this.canFire = true;
          this.blast?.setVisible(false);
          this.blast?.anims.pause(this.blast?.anims.currentAnim.frames[0]);
        }, 1000 / this.rateOfFire);
      }
    }
  }

  private updateCanReload(): void {
    this.canReload = this.ammo.length > 0 && this.clipSize > this.currentClip.ammo.length;
  }

  public interact(player: Player): void {
    if (this.isDropped && player.isInteracting) {
      player.addWeapon(this);
    }
  }

  public reload(): void {
    this.updateCanReload();
    if (this.canReload && !this.isReloading) {
      this.isReloading = true;
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
      setTimeout(() => { this.isReloading = false; }, this.reloadTime);
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
    this.scene.load.spritesheet(
      this.fireBlast,
      `assets/${this.fireBlast}.png`,
      { frameWidth: this.fireBlastFrameWidth, frameHeight: this.fireBlastFrameWidth },
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
    this.icon.setDepth(WEAPON_ICON_DIMENSIONS.depth);
    if (!this.player && !this.x && !this.y) {
      throw new Error(
        'Need to either place the weapon or attach it to a player before creating it',
      );
    }
    const x = this.player?.sprite?.x ?? this.x;
    const y = this.player?.sprite?.y ?? this.y;
    this.sprite = this.scene.physics.add.sprite(x!, y!, this.imageName);
    this.sprite.setDepth(this.depth);
    this.blast = this.scene.physics.add.sprite(x!, y!, this.fireBlast);
    this.blast.setDepth(this.depth);
    this.blast.setVisible(false);
    this.icon.setVisible(false);
    this.scene.anims.create({
      key: this.fireAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.imageName, {
        start: 0,
        end: this.fireFrames,
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
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.emptyAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.imageName, {
        start: 4,
        end: 4,
      }),
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.fireBlastAnimation,
      frames: this.scene.anims.generateFrameNumbers(this.fireBlast, {
        start: 0,
        end: this.fireBlastFrames,
      }),
      frameRate: this.frameRate,
      repeat: 0,
    });
    this.ammo.forEach((bullet) => {
      bullet.create();
    });
    this.currentClip.ammo.forEach((bullet) => {
      bullet.create();
    });
  }

  public createColliders(): void {
    this.scene.physics.add.collider(this.sprite!, this.scene.ground!);
    this.colliders.push(this.scene.physics.add.overlap(
      this.sprite!,
      this.scene.player.sprite!,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_o1, _o2) => {
        this.interact(this.scene.player);
      },
    ));
    this.ammo.forEach((bullet) => {
      bullet.createColliders();
    });
    this.currentClip.ammo.forEach((bullet) => {
      bullet.createColliders();
    });
  }

  setScene(scene: ILevel): void {
    this.scene = scene;
  }

  public update(): void {
    if (!this.player) {
      this.isDropped = true;
      this.sprite?.setVisible(true);
      this.sprite?.setGravityY(30);
      this.sprite?.anims.play(this.loadedAnimation);
    } else if (this.player!.equippedWeapon === this) {
      this.isDropped = false;
      this.sprite!.setVisible(true);
      this.sprite!.setVelocity(0, 0);
      const playerFacingMultiplier = (this.player.facingRight ? 1 : -1);
      const xOffset = this.player.facingRight
        ? this.player.frameWidth + 5
        : -5;
      const yOffset = this.player.frameHeight / 2;
      this.sprite!.setX(this.player!.sprite!.body.x + xOffset);
      this.sprite!.setY(this.player!.sprite!.body.y + yOffset);
      this.blast!.setX(
        this.player!.sprite!.body.x
        + xOffset
        + ((5 + this.fireBlastFrameWidth) * playerFacingMultiplier),
      );
      this.blast!.setY(this.player!.sprite!.body.y + yOffset - 5);
      this.blast!.setVelocity(0, 0);
      if (this.isFiring) {
        this.sprite!.anims.play(this.fireAnimation, true);
        this.blast!.anims.play(this.fireBlastAnimation, true);
      }
      if (this.isReloading || this.currentClip.isEmpty()) {
        this.sprite!.anims.play(this.emptyAnimation, true);
      } else if (this.canFire) {
        this.sprite!.anims.play(this.loadedAnimation, true);
      } else {
        this.sprite!.anims.play(this.fireAnimation, true);
        this.blast!.anims.play(this.fireBlastAnimation, true);
      }
      if (this.player!.facingRight) {
        this.sprite!.flipX = false;
        this.blast!.flipX = false;
      } else {
        this.sprite!.flipX = true;
        this.blast!.flipX = true;
      }
    } else {
      this.sprite?.setVisible(false);
    }
    this.ammo.forEach((bullet) => bullet.update());
    this.firedBullets.forEach((bullet) => bullet.update());
    this.currentClip.update();
  }
}
