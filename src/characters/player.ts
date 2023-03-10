import Phaser from 'phaser';
import PlayerError from '../errors/player';
import {
  KeyType,
  ILevel,
  IPowerUp,
  ISpriteContainer,
} from '../types';
import Fist from '../weapons/fist';
import HUD from '../objects/hud';
import { DEFAULT_DEPTH } from '../constants';
import { Key, IWeapon } from '../generics';

const GUY_NAME = 'dumbguy';

export type KeyRing = {
  [keyType in KeyType]: Key[];
}

/**
 * The optional and require properties to initialize a player
 */
export interface PlayerProps {
  scene: ILevel;
  x: number;
  y: number;
  spriteName?: string;
  spriteSheet?: string;
  frameRate?: number;
  weapons?: IWeapon[];
  equippedWeapon?: IWeapon;
  health?: number;
}

type KeyboardKey = {
  isDown: boolean;
}

/**
 * Using this to make the compiler happy when type checking the cursors
 */
type KeyboardInput = {
  up: KeyboardKey;
  left: KeyboardKey;
  down: KeyboardKey;
  right: KeyboardKey;
  space: KeyboardKey;
  shift: KeyboardKey;
  action: KeyboardKey;
  reload: KeyboardKey;
  drop: KeyboardKey;
  cycleWeapons: KeyboardKey;
}

export default class Player implements ISpriteContainer {
  public scene: ILevel;

  private x: number;

  private y: number;

  public depth = DEFAULT_DEPTH + 100;

  public spriteName: string;

  public spriteSheet: string;

  public frameRate: number;

  public frameHeight = 24;

  public frameWidth = 24;

  public speed = 100;

  public gravity = 300;

  private turnFrameStart = 0;

  private turnFrameSize = 9;

  private runningFrameStart = this.turnFrameStart + this.turnFrameSize;

  private runningFrameSize = 13;

  private runName: string;

  private turnName: string;

  private descendingName: string;

  private descendingFrame = this.runningFrameStart + this.runningFrameSize;

  private ascendingName: string;

  private ascendingFrame = this.descendingFrame + 1;

  private deathName: string;

  private hurtName: string;

  private deathFrameStart = this.descendingFrame + 1;

  private hurtFrameSize = 4;

  private deathFrameSize = 17;

  public facingRight = true;

  public sprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  public cursor?: KeyboardInput;

  public weapons: IWeapon[] = [];

  public keys: KeyRing = {
    [KeyType.SMALL]: [],
    [KeyType.MEDIUM]: [],
    [KeyType.LARGE]: [],
  };

  public equippedWeapon: IWeapon;

  private maxHealth = 100;

  public health: number;

  public isAlive = true;

  public HeadsUpDisplay: HUD;

  public takingDamage = false;

  private isSwitchingWeapons = false;

  public isInteracting = false;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  public powerUps: IPowerUp[] = [];

  constructor(props: PlayerProps) {
    this.scene = props.scene;
    this.x = props.x;
    this.y = props.y;
    const fist = new Fist({ scene: this.scene, player: this });
    props.weapons?.forEach((weapon) => weapon.setScene(this.scene));
    props.weapons?.push(fist);
    this.weapons = props.weapons ?? [fist];
    this.equippedWeapon = props.equippedWeapon ?? this.weapons[0];
    this.spriteName = props.spriteName ?? GUY_NAME;
    this.spriteSheet = props.spriteSheet ?? `${GUY_NAME}.png`;
    this.frameRate = props.frameRate ?? 20;
    this.health = props.health ?? this.maxHealth;
    this.runName = `${this.spriteName}Run`;
    this.turnName = `${this.spriteName}Turn`;
    this.ascendingName = `${this.spriteName}Ascending`;
    this.descendingName = `${this.spriteName}Descending`;
    this.hurtName = `${this.spriteName}Hurt`;
    this.deathName = `${this.spriteName}Death`;
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
      reload: Phaser.Input.Keyboard.KeyCodes.R,
      drop: Phaser.Input.Keyboard.KeyCodes.Q,
      cycleWeapons: Phaser.Input.Keyboard.KeyCodes.F,
    }) as KeyboardInput;
    this.sprite = this.scene.physics.add.sprite(
      this.x,
      this.y,
      this.spriteName,
    );
    this.sprite!.setDepth(this.depth);
    this.sprite!.body.setGravityY(this.gravity);
    this.sprite!.setBounce(0.2);
    this.scene.anims.create({
      key: this.runName,
      frames: this.scene.anims.generateFrameNumbers(this.spriteName, {
        start: this.runningFrameStart,
        end: this.runningFrameStart + this.runningFrameSize - 1,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
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
      key: this.ascendingName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.ascendingFrame,
        end: this.ascendingFrame,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.descendingName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.descendingFrame,
        end: this.descendingFrame,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    this.scene.anims.create({
      key: this.deathName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.deathFrameStart,
        end: this.deathFrameStart + this.deathFrameSize,
      }),
      frameRate: this.frameRate / 4,
    });
    this.scene.anims.create({
      key: this.hurtName,
      frames: this.scene.anims.generateFrameNames(this.spriteName, {
        start: this.deathFrameStart,
        end: this.deathFrameStart + this.hurtFrameSize,
      }),
      frameRate: this.frameRate,
    });
    this.weapons.forEach((weapon) => weapon.create());
    this.HeadsUpDisplay.create();
  }

  public createColliders(): void {
    this.sprite!.setCollideWorldBounds(true);
    this.scene.physics.add.collider(this.sprite!, this.scene.ground!);
    this.weapons.forEach((weapon) => weapon.createColliders());
  }

  public update() {
    if (!(this.sprite) || !(this.cursor)) {
      throw new PlayerError(
        'The required attributes are not set, please call Player.create()'
        + ' before using this method',
      );
    }

    if (this.isAlive) {
      if (!this.takingDamage) {
        if (this.cursor.left.isDown) {
          this.runLeft();
        } else if (this.cursor.right.isDown) {
          this.runRight();
        } else if (!this.takingDamage) {
          this.sprite.setVelocityX(0);
        }
        if (this.cursor.up.isDown && this.sprite.body.onFloor()) {
          this.sprite.setVelocityY(-1 * this.gravity);
        }
        if (this.cursor.cycleWeapons.isDown && !this.isSwitchingWeapons) {
          this.isSwitchingWeapons = true;
          this.switchWeapons();
        }
        if (this.sprite.body.velocity.y < -10) {
          this.ascending();
        } else if (this.sprite.body.velocity.y > 10) {
          this.descending();
        } else if (this.sprite.body.velocity.x === 0) {
          this.turn();
        }
      } else {
        this.sprite.anims.play(this.hurtName, true);
      }
      if (this.cursor.space.isDown) {
        this.equippedWeapon.fire();
      }
      if (this.cursor.reload.isDown) {
        this.equippedWeapon.reload();
      }
      if (this.cursor.drop.isDown) {
        this.dropWeapon();
      }
      if (this.cursor.action.isDown) {
        this.isInteracting = true;
      } else {
        this.isInteracting = false;
      }
      this.equippedWeapon.sprite!.setDepth(this.sprite.depth);
    } else {
      this.andStayDead();
    }
    if (this.facingRight) {
      this.sprite.flipX = false;
    } else {
      this.sprite.flipX = true;
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

  /**
   * Try to heal the player by a number at most up to the max health
   * @param health - The amount of health to try and heal by
   */
  public addHealth(health: number): void {
    this.health += Math.min(this.maxHealth - this.health, health);
  }

  /**
   * Brings the player's health to the maximum health
   */
  public fullHeal(): void {
    this.health = this.maxHealth;
  }

  /**
   * Getter method for the max health
   * @returns the current max healt
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Increments the max available health
   * @param healthAmount - The amount to increase the max health by
   */
  public increaseMaxHealth(healthAmount: number): void {
    this.maxHealth += healthAmount;
  }

  public die(): void {
    this.isAlive = false;
  }

  private andStayDead(): void {
    this.sprite?.setVelocity(0, 0);
    const animationIndex = (this.sprite?.anims.currentFrame?.index ?? -1 + 1);
    if (animationIndex < this.deathFrameSize) {
      this.sprite?.anims.play(this.deathName, true);
    } else {
      this.sprite?.anims.pause(this.sprite.anims.currentAnim.frames[-1]);
    }
  }

  private playIfNotTakingDamage(fn: () => void): void {
    if (!this.takingDamage) {
      fn();
    }
  }

  private runLeft(): void {
    this.facingRight = false;
    this.sprite?.setVelocityX(-1 * this.speed);
    this.playIfNotTakingDamage(() => this.sprite?.anims.play(this.runName, true));
  }

  private runRight(): void {
    this.facingRight = true;
    this.sprite?.setVelocityX(this.speed);
    this.playIfNotTakingDamage(() => this.sprite?.anims.play(this.runName, true));
  }

  private turn(): void {
    this.playIfNotTakingDamage(() => this.sprite?.anims.play(this.turnName, true));
  }

  private ascending(): void {
    this.sprite?.anims.play(this.ascendingName, true);
  }

  private descending(): void {
    this.sprite?.anims.play(this.descendingName, true);
  }

  public addWeapon(weapon: IWeapon): void {
    // eslint-disable-next-line no-param-reassign
    weapon.player = this;
    weapon.sprite!.setDepth(this.depth);
    this.weapons.push(weapon);
    this.equippedWeapon.displayIcon(false);
    weapon.displayIcon(true);
    this.equippedWeapon = weapon;
  }

  public switchWeapons(): void {
    const currentWeaponIndex = this.weapons.indexOf(this.equippedWeapon);
    const nextWeaponIndex = (currentWeaponIndex + 1) % this.weapons.length;
    this.equippedWeapon.displayIcon(false);
    this.equippedWeapon = this.weapons[nextWeaponIndex];
    this.equippedWeapon.displayIcon(true);
    setTimeout(() => { this.isSwitchingWeapons = false; }, 500);
  }

  public dropWeapon(): void {
    if (this.equippedWeapon.canDrop) {
      const weaponToDrop = this.equippedWeapon;
      weaponToDrop.displayIcon(false);
      this.switchWeapons();
      this.weapons.forEach((weapon, index) => {
        if (weapon === weaponToDrop) {
          const removed = this.weapons.splice(index, 1)[0];
          removed.sprite!.setVelocityY(-this.gravity);
          removed.sprite!.setGravityY(this.gravity);
          removed.sprite!.setX(this.sprite?.body.x);
          removed.sprite!.setY(this.sprite?.body.y);
          removed.player = undefined;
          removed.isDropped = true;
          this.scene.addObject(removed);
        }
      });
    }
  }

  public hasKey(keyType: KeyType): boolean {
    return this.keys[keyType].length > 0;
  }

  public getKey(keyType: KeyType): Key | undefined {
    return this.keys[keyType].pop();
  }

  public addKey(key: Key): void {
    this.keys[key.type].push(key);
    key.setCarrier(this);
  }

  /**
   * Return the properties that would be used to re-initialize the player as-is
   */
  public getProps(): PlayerProps {
    const props: PlayerProps = {
      scene: this.scene,
      x: this.x,
      y: this.y,
      health: this.health,
    };
    return props;
  }

  setScene(scene: ILevel): void {
    this.scene = scene;
  }
}
