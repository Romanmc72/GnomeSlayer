import Phaser from 'phaser';
import {
  Enemy,
  Level,
  Projectile,
  ProjectileOnlyWeapon,
  Weapon,
} from '../types';
import Player from './player';
import { MeleeOnlyWeapon } from '../types/weapon';
import { INFINITY } from '../constants';

export default class SmolGnome implements Enemy {
  public scene: Level;

  public health = 30;

  public name = 'SmolGnome';

  public jump = 100;

  private jumpProbability = 0.30;

  private spriteName = 'smolGnome';

  private spriteSheet = `${this.spriteName}.png`;

  private frameWidth = 24;

  private frameHeight = this.frameWidth;

  public attackDamage = 5;

  public isAlive = true;

  private x: number;

  private y: number;

  public sprite?: Phaser.Physics.Arcade.Sprite;

  private frameRate = 20;

  private turnName: string;

  private turnFrameStart = 1;

  private turnFrameSize = 6;

  private runName: string;

  private runFrameStart = this.turnFrameStart + this.turnFrameSize;

  private runFrameSize = 2;

  private hurtName: string;

  private hurtFrame = 0;

  private deathName: string;

  private deathFrameStart = this.runFrameStart + this.runFrameSize;

  private deathFrameSize = 13;

  private immunities: Weapon[] = [];

  private speed = 50;

  private takingDamage = false;

  private isDoingSomething = false;

  private hitRecoveryPeriodMs = 250;

  public id: number;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  public facingRight = false;

  constructor(scene: Level, x: number, y: number, id: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.id = id;
    this.turnName = `${this.name}Turn`;
    this.runName = `${this.name}Run`;
    this.hurtName = `${this.name}Hurt`;
    this.deathName = `${this.name}Die`;
  }

  private resetDamage() {
    this.takingDamage = false;
  }

  private resetDoingSomething() {
    this.isDoingSomething = false;
  }

  public attack(player: Player) {
    if (this.isAlive && !player.takingDamage) {
      player.takeDamage(this.attackDamage);
      const blowback = player.gravity / 2;
      player.sprite?.setVelocityY(-1 * blowback);
      if (this.sprite?.body.touching.left) {
        player.sprite?.setVelocityX(-1 * blowback);
      } else if (this.sprite?.body.touching.right) {
        player.sprite?.setVelocityX(blowback);
      } else if (this.sprite?.body.touching.up) {
        player.sprite?.setVelocityX(Math.random() > 0.5 ? blowback : -1 * blowback);
      }
    }
  }

  public takeDamage(damage: number): void {
    if (!this.takingDamage) {
      this.health -= damage;
      this.takingDamage = true;
      this.isDoingSomething = false;
      setTimeout(() => this.resetDamage(), this.hitRecoveryPeriodMs);
      if (this.health <= 0) {
        this.die();
      }
    }
  }

  private damageAnimation() {
    this.isDoingSomething = true;
    setTimeout(() => this.resetDoingSomething(), this.hitRecoveryPeriodMs);
    this.sprite?.setVelocityY(-150);
    if (this.sprite!.body.touching.left) {
      this.facingRight = false;
      this.sprite?.setVelocityX(150);
    } else {
      this.facingRight = true;
      this.sprite?.setVelocityX(-150);
    }
    this.sprite!.anims.play(this.hurtName, true);
  }

  public isImmune(weapon: Weapon): boolean {
    if (this.immunities.includes(weapon)) {
      return true;
    }
    return false;
  }

  public die(): void {
    this.isAlive = false;
    this.disableColliders();
  }

  private andStayDead() {
    this.sprite?.setVelocity(0, 0);
    const animationIndex = (this.sprite?.anims.currentFrame?.index ?? -1 + 1);
    if (animationIndex < this.deathFrameSize) {
      this.sprite?.anims.play(this.deathName, true);
    } else {
      this.sprite?.anims.pause(this.sprite.anims.currentAnim.frames[-1]);
    }
  }

  public preload(): void {
    this.scene.load.spritesheet(
      this.spriteName,
      `assets/${this.spriteSheet}`,
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
  }

  public create(): void {
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, this.spriteName);
    this.sprite.setGravityY(300);
    this.sprite.setCollideWorldBounds(true);
    this.scene.anims.create({
      key: this.turnName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.turnFrameStart,
        end: this.turnFrameStart + this.turnFrameSize - 1,
      }),
      frameRate: this.frameRate / 4,
      repeat: -1,
      yoyo: true,
    });
    this.scene.anims.create({
      key: this.hurtName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.hurtFrame,
        end: this.hurtFrame,
      }),
    });
    this.scene.anims.create({
      key: this.runName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.runFrameStart,
        end: this.runFrameStart + this.runFrameSize - 1,
      }),
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.deathName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.deathFrameStart,
        end: this.deathFrameStart + this.deathFrameSize - 1,
      }),
      frameRate: this.frameRate / 4,
      repeat: 0,
    });
    // Not adding to the colliders array because this should always be enabled
    this.scene.physics.add.collider(this.sprite, this.scene.ground!);
    this.colliders.push(
      this.scene.physics.add.collider(
        this.scene.player.sprite!,
        this.sprite,
        (_o1, _o2) => {
          this.attack(this.scene.player);
        },
      ),
    );
    this.scene.player.weapons.forEach((weapon) => {
      if (weapon.isMelee) {
        const meleeWeapon = weapon as MeleeOnlyWeapon;
        this.colliders.push(
          this.scene.physics.add.overlap(
            meleeWeapon.sprite!,
            this.sprite!,
            (_o1, _o2) => {
              meleeWeapon.onHit(this);
              if (this.health <= 0) {
                this.die();
              }
            },
          ),
        );
      }
      if (weapon.isProjectile) {
        const projectileWeapon = weapon as ProjectileOnlyWeapon<Projectile>;
        if (projectileWeapon.ammo !== INFINITY) {
          projectileWeapon.ammo.forEach((projectile: Projectile) => {
            const collider = this.scene.physics.add.collider(
              projectile.sprite!,
              this.sprite!,
              (_o1, _o2) => {
                projectile.hit(this);
                if (this.health <= 0) {
                  this.die();
                }
              },
            );
            this.colliders.push(collider);
            projectile.colliders.push(collider);
          });
        }
        projectileWeapon.currentClip.ammo.forEach((projectile) => {
          const collider = this.scene.physics.add.collider(
            projectile.sprite!,
            this.sprite!,
            (_o1, _o2) => {
              projectile.hit(this);
              if (this.health <= 0) {
                this.die();
              }
            },
          );
          this.colliders.push(collider);
          projectile.colliders.push(collider);
        });
      }
    });
    this.colliders.push(
      this.scene.physics.add.collider(
        this.scene.player.sprite!,
        this.sprite,
        (_o1, _o2) => {
          this.attack(this.scene.player);
        },
      ),
    );
  }

  private disableColliders(): void {
    this.colliders.forEach((collider) => {
      // eslint-disable-next-line no-param-reassign
      collider.active = false;
    });
  }

  private runLeft() {
    this.facingRight = false;
    this.sprite?.setVelocityX(this.speed * -1);
    this.sprite?.anims.play(this.runName, true);
  }

  private runRight() {
    this.facingRight = true;
    this.sprite?.setVelocityX(this.speed);
    this.sprite?.anims.play(this.runName, true);
  }

  private turnRight() {
    this.facingRight = true;
    this.sprite?.setVelocityX(0);
    this.sprite?.anims.play(this.turnName, true);
  }

  private turnLeft() {
    this.facingRight = false;
    this.sprite?.setVelocityX(0);
    this.sprite?.anims.play(this.turnName, true);
  }

  public update(): void {
    if (this.isAlive) {
      if (!this.isDoingSomething) {
        if (!this.takingDamage) {
          const seed = Math.random();
          const jumpSeed = Math.random();
          const randomDuration = Math.floor(Math.random() * 1000);
          this.isDoingSomething = true;
          if (seed < 0.25) {
            this.turnLeft();
          } else if (seed < 0.50) {
            this.turnRight();
          } else if (seed < 0.75) {
            this.runLeft();
          } else {
            this.runRight();
          }
          if (jumpSeed <= this.jumpProbability && this.sprite?.body.touching.down) {
            this.sprite?.setVelocityY(-this.jump);
          }
          setTimeout(() => this.resetDoingSomething(), randomDuration);
        } else {
          this.damageAnimation();
        }
      }
    } else {
      this.andStayDead();
    }
    if (this.facingRight) {
      this.sprite!.flipX = false;
    } else {
      this.sprite!.flipX = true;
    }
  }
}
