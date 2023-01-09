import Phaser from 'phaser';
import PlayerError from '../errors/player';
import { SpriteContainer } from '../types/spriteContainer';
import Weapon from '../weapons/weapon';
import Fist from '../weapons/fist';
import HUD from '../objects/hud';

const GUY_NAME = 'dumbguy';

/**
 * The optional and require properties to initialize a player
 */
export interface PlayerProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
  spriteName?: string;
  spriteSheet?: string;
  frameRate?: number;
  weapons?: Weapon[];
  equippedWeapon?: Weapon;
  health?: number;
}

export default class Player implements SpriteContainer {
  public scene: Phaser.Scene;

  private x: number;

  private y: number;

  public spriteName: string;

  public spriteSheet: string;

  public frameRate: number;

  public frameHeight = 24;

  public frameWidth = 24;

  public speed = 100;

  public gravity = 300;

  private turnFrameStart = 0;

  private turnFrameSize = 9;

  private runningFrameStart = 18;

  private runningFrameSize = 13;

  private runLeftName: string;

  private runRightName: string;

  private turnLeftName: string;

  private turnRightName: string;

  private ascendingLeftName: string;

  private ascendingRightName: string;

  private descendingLeftName: string;

  private descendingRightName: string;

  private deathAnimation: string;

  private hurtRight: string;

  private hurtLeft: string;

  private deathFrames = 17;

  public facingRight = true;

  public sprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  public cursor?: Phaser.Types.Input.Keyboard.CursorKeys;

  public weapons: Weapon[] = [];

  public equippedWeapon: Weapon;

  public health: number;

  public isDead = false;

  public HeadsUpDisplay: HUD;

  private takingDamage = false;

  constructor(props: PlayerProps) {
    this.scene = props.scene;
    this.x = props.x;
    this.y = props.y;
    this.weapons = props.weapons ?? [new Fist(this.scene, this)];
    this.equippedWeapon = props.equippedWeapon ?? this.weapons[0];
    this.spriteName = props.spriteName ?? GUY_NAME;
    this.spriteSheet = props.spriteSheet ?? `${GUY_NAME}.png`;
    this.frameRate = props.frameRate ?? 20;
    this.health = props.health ?? 100;
    this.runLeftName = `${this.spriteName}RunLeft`;
    this.runRightName = `${this.spriteName}RunRight`;
    this.turnLeftName = `${this.spriteName}TurnLeft`;
    this.turnRightName = `${this.spriteName}TurnRight`;
    this.ascendingLeftName = `${this.spriteName}AscendingLeft`;
    this.ascendingRightName = `${this.spriteName}AscendingRight`;
    this.descendingLeftName = `${this.spriteName}DescendingLeft`;
    this.descendingRightName = `${this.spriteName}DescendingRight`;
    this.hurtRight = `${this.spriteName}HurtRight`;
    this.hurtLeft = `${this.spriteName}HurtLeft`;
    this.deathAnimation = `${this.spriteName}Death`;
    this.HeadsUpDisplay = new HUD(this.scene, this);
  }

  public preload() {
    this.scene.load.spritesheet(
      this.spriteName,
      `assets/${this.spriteSheet}`,
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
    this.weapons.forEach((weapon) => weapon.preload());
    this.HeadsUpDisplay.preload();
  }

  public create() {
    this.cursor = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      action: Phaser.Input.Keyboard.KeyCodes.E,
      drop: Phaser.Input.Keyboard.KeyCodes.Q,
      cycleWeapons: Phaser.Input.Keyboard.KeyCodes.F,
    }) as Phaser.Types.Input.Keyboard.CursorKeys;
    this.sprite = this.scene.physics.add.sprite(
      this.x,
      this.y,
      this.spriteName,
    );
    this.sprite.body.setGravityY(this.gravity);
    this.sprite.setBounce(0.2);
    this.sprite.setCollideWorldBounds(true);
    this.scene.anims.create({
      key: this.runRightName,
      frames: this.scene.anims.generateFrameNumbers(this.spriteName, {
        start: this.runningFrameStart,
        end: this.runningFrameStart + this.runningFrameSize - 1,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.runLeftName,
      frames: this.scene.anims.generateFrameNumbers(this.spriteName, {
        start: this.runningFrameStart + this.runningFrameSize,
        end: this.runningFrameStart + (2 * this.runningFrameSize) - 1,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.turnRightName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.turnFrameStart,
        end: this.turnFrameStart + this.turnFrameSize - 1,
      }),
      frameRate: this.frameRate / 4,
      repeat: -1,
      yoyo: true,
    });
    this.scene.anims.create({
      key: this.turnLeftName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.turnFrameStart + this.turnFrameSize,
        end: this.turnFrameStart + (this.turnFrameSize * 2) - 1,
      }),
      frameRate: this.frameRate / 4,
      repeat: -1,
      yoyo: true,
    });
    const airborneFrameStart = this.runningFrameStart + (2 * this.runningFrameSize);
    this.scene.anims.create({
      key: this.ascendingLeftName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: airborneFrameStart,
        end: airborneFrameStart,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.descendingLeftName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: airborneFrameStart + 1,
        end: airborneFrameStart + 1,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.descendingRightName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: airborneFrameStart + 2,
        end: airborneFrameStart + 2,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.ascendingRightName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: airborneFrameStart + 3,
        end: airborneFrameStart + 3,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.deathAnimation,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: airborneFrameStart + 4,
        end: airborneFrameStart + 4 + this.deathFrames,
      }),
      frameRate: this.frameRate / 4,
    });
    this.scene.anims.create({
      key: this.hurtRight,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: airborneFrameStart + 4,
        end: airborneFrameStart + 4 + 4,
      }),
      frameRate: this.frameRate,
    });
    this.scene.anims.create({
      key: this.hurtLeft,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: airborneFrameStart + 4 + this.deathFrames,
        end: airborneFrameStart + 4 + this.deathFrames + 4,
      }),
      frameRate: this.frameRate,
    });
    this.weapons.forEach((weapon) => weapon.create());
    this.HeadsUpDisplay.create();
  }

  public update() {
    if (!(this.sprite) || !(this.cursor)) {
      throw new PlayerError(
        'The required attributes are not set, please call Player.create()'
        + ' before using this method',
      );
    }

    if (!this.isDead) {
      if (!this.takingDamage) {
        if (this.cursor.left.isDown) {
          this.runLeft();
        } else if (this.cursor.right.isDown) {
          this.runRight();
        } else if (!this.takingDamage) {
          this.sprite.setVelocityX(0);
        }
        if (this.cursor.up.isDown && this.sprite.body.touching.down) {
          this.sprite.setVelocityY(-1 * this.gravity);
        }
        if (this.sprite.body.velocity.y < -10) {
          if (this.facingRight) {
            this.ascendingRight();
          } else {
            this.ascendingLeft();
          }
        } else if (this.sprite.body.velocity.y > 10) {
          if (this.facingRight) {
            this.descendingRight();
          } else {
            this.descendingLeft();
          }
        } else if (this.sprite.body.velocity.x === 0) {
          if (this.facingRight) {
            this.turnRight();
          } else {
            this.turnLeft();
          }
        }
      } else if (this.facingRight) {
        this.sprite.anims.play(this.hurtRight, true);
      } else {
        this.sprite.anims.play(this.hurtLeft, true);
      }
      if (this.cursor.space.isDown) {
        this.equippedWeapon.fire();
      }
    } else {
      this.andStayDead();
    }
    this.weapons.forEach((weapon) => weapon.update());
    this.HeadsUpDisplay.update();
  }

  public takeDamage(damage: number): void {
    if (!this.takingDamage) {
      this.takingDamage = true;
      this.health = Math.max(this.health - damage, 0);
      setTimeout(() => { this.takingDamage = false; }, 250);
    }
    if (this.health <= 0) {
      this.die();
    }
  }

  public die(): void {
    this.isDead = true;
  }

  private andStayDead(): void {
    this.sprite?.setVelocity(0, 0);
    const animationIndex = (this.sprite?.anims.currentFrame?.index ?? -1 + 1);
    if (animationIndex < this.deathFrames) {
      this.sprite?.anims.play(this.deathAnimation, true);
    } else {
      this.sprite?.anims.pause(this.sprite.anims.currentAnim.frames[-1]);
    }
  }

  private playIfNotTakingDamage(fn: () => void): void {
    if (!this.takingDamage) {
      fn();
    }
  }

  private runLeft() {
    this.facingRight = false;
    this.sprite?.setVelocityX(-1 * this.speed);
    this.playIfNotTakingDamage(() => this.sprite?.anims.play(this.runLeftName, true));
  }

  private runRight() {
    this.facingRight = true;
    this.sprite?.setVelocityX(this.speed);
    this.sprite?.anims.play(this.runRightName, true);
  }

  private turnLeft() {
    this.facingRight = false;
    this.sprite?.anims.play(this.turnLeftName, true);
  }

  private turnRight() {
    this.facingRight = true;
    this.sprite?.anims.play(this.turnRightName, true);
  }

  private ascendingRight() {
    this.sprite?.anims.play(this.ascendingRightName, true);
  }

  private ascendingLeft() {
    this.sprite?.anims.play(this.ascendingLeftName, true);
  }

  private descendingRight() {
    this.sprite?.anims.play(this.descendingRightName, true);
  }

  private descendingLeft() {
    this.sprite?.anims.play(this.descendingLeftName, true);
  }
}
