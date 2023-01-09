import Phaser from 'phaser';
import Weapon from '../weapons/weapon';
import Enemy from './enemy';
import Player from './player';

export default class SmolGnome implements Enemy {
  public scene: Phaser.Scene;

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

  private turnRightName: string;

  private turnLeftName: string;

  private runRightName: string;

  private runLeftName: string;

  private hurtRightName: string;

  private hurtLeftName: string;

  private deathAnimation: string;

  private deathFrames = 13;

  private immunities: Weapon[] = [];

  private speed = 50;

  private takingDamage = false;

  private isDoingSomething = false;

  private hitRecoveryPeriodMs = 250;

  public id: number;

  constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.id = id;
    this.turnRightName = `${this.name}turnRight`;
    this.turnLeftName = `${this.name}turnLeft`;
    this.runRightName = `${this.name}runRight`;
    this.runLeftName = `${this.name}runLeft`;
    this.hurtRightName = `${this.name}hurtRight`;
    this.hurtLeftName = `${this.name}hurtLeft`;
    this.deathAnimation = `${this.name}die`;
  }

  private resetDamage() {
    this.takingDamage = false;
  }

  private resetDoingSomething() {
    this.isDoingSomething = false;
  }

  public attack(player: Player) {
    if (this.isAlive) {
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
      this.sprite?.setVelocityX(150);
      this.sprite!.anims.play(this.hurtRightName, true);
    } else {
      this.sprite?.setVelocityX(-150);
      this.sprite!.anims.play(this.hurtLeftName, true);
    }
  }

  public isImmune(weapon: Weapon): boolean {
    if (this.immunities.includes(weapon)) {
      return true;
    }
    return false;
  }

  public die(): void {
    this.isAlive = false;
  }

  private andStayDead() {
    this.sprite?.setVelocity(0, 0);
    const animationIndex = (this.sprite?.anims.currentFrame?.index ?? -1 + 1);
    if (animationIndex < this.deathFrames) {
      this.sprite?.anims.play(this.deathAnimation, true);
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
      key: this.turnLeftName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: 0,
        end: 5,
      }),
      frameRate: this.frameRate / 4,
      repeat: -1,
      yoyo: true,
    });
    this.scene.anims.create({
      key: this.turnRightName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: 8,
        end: 14,
      }),
      frameRate: this.frameRate / 4,
      repeat: -1,
      yoyo: true,
    });
    this.scene.anims.create({
      key: this.hurtLeftName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: 6,
        end: 6,
      }),
    });
    this.scene.anims.create({
      key: this.hurtRightName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: 7,
        end: 7,
      }),
    });
    this.scene.anims.create({
      key: this.runLeftName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: 14,
        end: 15,
      }),
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.runRightName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: 16,
        end: 17,
      }),
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.deathAnimation,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: 18,
        end: 18 + this.deathFrames,
      }),
      frameRate: this.frameRate / 4,
      repeat: 0,
    });
  }

  private runLeft() {
    this.sprite?.setVelocityX(this.speed * -1);
    this.sprite?.anims.play(this.runLeftName, true);
  }

  private runRight() {
    this.sprite?.setVelocityX(this.speed);
    this.sprite?.anims.play(this.runRightName, true);
  }

  private turnRight() {
    this.sprite?.setVelocityX(0);
    this.sprite?.anims.play(this.turnRightName, true);
  }

  private turnLeft() {
    this.sprite?.setVelocityX(0);
    this.sprite?.anims.play(this.turnLeftName, true);
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
  }
}
