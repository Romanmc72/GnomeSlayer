import Phaser from 'phaser';
import { SpriteContainer } from '../types/spriteContainer';

const GUY_NAME = 'dumbguy';

export class PlayerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerError';
  }
}

export default class Player implements SpriteContainer {
  public scene: Phaser.Scene;

  private x: number;

  private y: number;

  public spriteName: string;

  public spriteSheet: string;

  public frameRate: number;

  public frameHeight: number = 24;
  
  public frameWidth: number = 24;

  public speed: number = 100;

  public gravity: number = 300;

  private turnFrameStart: number = 0;

  private turnFrameSize: number = 9;

  private runningFrameStart: number = 18;

  private runningFrameSize: number = 13;
  
  private runLeftName: string;

  private runRightName: string;
  
  private turnLeftName: string;
  
  private turnRightName: string;

  private ascendingLeftName: string;

  private ascendingRightName: string;

  private descendingLeftName: string;

  private descendingRightName: string;

  private facingRight: boolean = true;

  public sprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  public cursor?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    spriteName = GUY_NAME,
    spriteSheet = `${GUY_NAME}.png`,
    frameRate = 20,
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.spriteName = spriteName;
    this.spriteSheet = spriteSheet;
    this.frameRate = frameRate;
    this.runLeftName = `${this.spriteName}RunLeft`;
    this.runRightName = `${this.spriteName}RunRight`;
    this.turnLeftName = `${this.spriteName}TurnLeft`;
    this.turnRightName = `${this.spriteName}TurnRight`;
    this.ascendingLeftName = `${this.spriteName}AscendingLeft`;
    this.ascendingRightName = `${this.spriteName}AscendingRight`;
    this.descendingLeftName = `${this.spriteName}DescendingLeft`;
    this.descendingRightName = `${this.spriteName}DescendingRight`;
  }

  public preload() {
    this.scene.load.spritesheet(
      this.spriteName,
      `assets/${this.spriteSheet}`,
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
  }

  public create() {
    this.cursor = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
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
  }

  public update() {
    if (!(this.sprite) || !(this.cursor)) {
      throw new PlayerError(
        'The required attributes are not set, please call Player.create()'
        + ' before using this method',
      );
    }

    if (this.cursor.left.isDown) {
      this.runLeft();
    } else if (this.cursor.right.isDown) {
      this.runRight();
    } else {
      this.sprite!.setVelocityX(0);
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
  }

  private runLeft() {
    this.facingRight = false;
    this.sprite!.setVelocityX(-1 * this.speed);
    this.sprite!.anims.play(this.runLeftName, true);
  }

  private runRight() {
    this.facingRight = true;
    this.sprite!.setVelocityX(this.speed);
    this.sprite!.anims.play(this.runRightName, true);
  }

  private turnLeft() {
    this.facingRight = false;
    this.sprite!.anims.play(this.turnLeftName, true);
  }

  private turnRight() {
    this.facingRight = true;
    this.sprite!.anims.play(this.turnRightName, true);
  }

  private ascendingRight() {
    this.sprite!.anims.play(this.ascendingRightName, true);
  }
  private ascendingLeft() {
    this.sprite!.anims.play(this.ascendingLeftName, true);
  }
  private descendingRight() {
    this.sprite!.anims.play(this.descendingRightName, true);
  }
  private descendingLeft() {
    this.sprite!.anims.play(this.descendingLeftName, true);
  }
}
