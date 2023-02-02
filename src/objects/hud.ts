import Phaser from 'phaser';
import Player from '../characters/player';
import {
  KeyType,
  Level,
  Projectile,
  ProjectileOnlyWeapon,
} from '../types';
import { DEFAULT_DEPTH, INFINITY, WEAPON_ICON_DIMENSIONS } from '../constants';

export default class HUD {
  public scene: Level;

  public depth = DEFAULT_DEPTH + 100;

  private player: Player;

  private healthBarRed = 'healthBarRed';

  private healthBarGreen = 'healthBarGreen';

  private healthBarWidth = 300;

  private healthSliverWidth = 3;

  private background?: Phaser.Types.Physics.Arcade.ImageWithStaticBody;

  private health: Phaser.Types.Physics.Arcade.ImageWithStaticBody[] = [];

  private x = 30;

  private y = 30;

  public isVisible = true;

  private prefix = 'hud-';

  private equippedLabel = `${this.prefix}equipped`;

  private healthLabel = `${this.prefix}health`;

  public texts: Phaser.Physics.Arcade.Image[] = [];

  public textColor = '#000000';

  public ammoRemaining?: Phaser.GameObjects.Text;

  private ammoRemainingXOffset = WEAPON_ICON_DIMENSIONS.x + (WEAPON_ICON_DIMENSIONS.width / 2) + 6;

  private ammoRemainingYOffset = WEAPON_ICON_DIMENSIONS.y - 40;

  public clipRemaining?: Phaser.GameObjects.Text;

  private clipRemainingXOffset = this.ammoRemainingXOffset;

  private clipRemainingYOffset = this.ammoRemainingYOffset - 20;

  private keyInventory: {[keyType in KeyType]: Phaser.GameObjects.Text | undefined} = {
    [KeyType.SMALL]: undefined,
    [KeyType.MEDIUM]: undefined,
    [KeyType.LARGE]: undefined,
  };

  private keyXOffset = this.ammoRemainingXOffset - 100;

  private keyYOffset = this.clipRemainingYOffset;

  public colliders: Phaser.Physics.Arcade.Collider[] = [];

  constructor(scene: Level, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  public preload(): void {
    this.scene.load.spritesheet(
      this.healthBarRed,
      `assets/${this.healthBarRed}.png`,
      { frameWidth: this.healthBarWidth, frameHeight: 10 },
    );
    this.scene.load.spritesheet(
      this.healthBarGreen,
      `assets/${this.healthBarGreen}.png`,
      { frameWidth: this.healthSliverWidth, frameHeight: 10 },
    );
    this.scene.load.spritesheet(
      this.equippedLabel,
      `assets/${this.equippedLabel}.png`,
      { frameWidth: 63, frameHeight: 8 },
    );
    this.scene.load.spritesheet(
      this.healthLabel,
      `assets/${this.healthLabel}.png`,
      { frameWidth: 47, frameHeight: 8 },
    );
  }

  private keepTextOnCamera(
    object: Phaser.GameObjects.Text,
    xOffset: number,
    yOffset: number,
  ): void {
    const x = (
      (this.scene.cameras.main.worldView.x + xOffset)
      * this.scene.cameras.main.zoom
    );
    object.setX(x);
    const y = (
      (this.scene.cameras.main.worldView.y + yOffset)
      * this.scene.cameras.main.zoom
    );
    object.setY(y);
  }

  private keepOnCamera(object: Phaser.Physics.Arcade.Image): void {
    const x = (
      (object.body.x + this.scene.cameras.main.worldView.x)
      * this.scene.cameras.main.zoom
    );
    object.setX(x);
    const y = (
      (object.body.y + this.scene.cameras.main.worldView.y)
      * this.scene.cameras.main.zoom
    );
    object.setY(y);
  }

  private createKeyMap(keyType: KeyType): void {
    this.keyInventory[keyType] = this.scene.add.text(
      this.keyXOffset,
      this.keyYOffset + 18 * keyType,
      `${this.player.keys[keyType].length}`,
      { color: this.textColor },
    );
  }

  public create(): void {
    this.background = this.scene.physics.add.staticImage(
      this.x + this.healthBarWidth - 3,
      this.y,
      this.healthBarRed,
    );
    this.background.depth = this.depth;
    for (let healthSliver = 0; healthSliver < 100; healthSliver += 1) {
      const sliver = this.scene.physics.add.staticImage(
        this.x + (this.healthSliverWidth * healthSliver),
        this.y,
        this.healthBarGreen,
      );
      sliver.depth = this.depth + 1;
      this.health.push(sliver);
    }
    this.texts.push(
      this.scene.physics.add.staticImage(
        WEAPON_ICON_DIMENSIONS.x + 6,
        WEAPON_ICON_DIMENSIONS.y - 60,
        this.equippedLabel,
      ),
    );
    this.ammoRemaining = this.scene.add.text(
      this.ammoRemainingXOffset,
      this.ammoRemainingYOffset,
      'AMMO',
      { color: this.textColor },
    );
    this.ammoRemaining.depth = this.depth;
    this.clipRemaining = this.scene.add.text(
      this.clipRemainingXOffset,
      this.clipRemainingYOffset,
      'CLIP',
      { color: this.textColor },
    );
    this.clipRemaining.depth = this.depth;
    const healthLabel = this.scene.physics.add.staticImage(
      this.x + 50,
      this.y - 16,
      this.healthLabel,
    );
    healthLabel.depth = this.depth;
    this.texts.push(healthLabel);
    this.createKeyMap(KeyType.SMALL);
    this.createKeyMap(KeyType.MEDIUM);
    this.createKeyMap(KeyType.LARGE);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  public createColliders(): void {}

  private updateKeyCount(keyType: KeyType): void {
    const keys = this.player.keys[keyType].length;
    this.keyInventory[keyType]!.setText(keys.toString());
    this.keepTextOnCamera(
      this.keyInventory[keyType]!,
      this.keyXOffset,
      this.keyYOffset + 18 * keyType,
    );
  }

  public update(): void {
    if (this.isVisible) {
      this.health.slice(0, this.player.health).forEach(
        (sliver) => {
          sliver.setVisible(true);
          this.keepOnCamera(sliver);
        },
      );
      this.health.slice(this.player.health, this.player.getMaxHealth()).forEach(
        (sliver) => {
          sliver.setVisible(false);
          this.keepOnCamera(sliver);
        },
      );
      this.player.weapons.forEach((weapon) => {
        weapon.displayIcon(false);
        this.keepOnCamera(weapon.icon!);
      });
      this.player.equippedWeapon.displayIcon(true);
      this.keepOnCamera(this.background!);
      this.texts.forEach((text) => this.keepOnCamera(text));
      if (this.player.equippedWeapon.ammo === INFINITY) {
        this.ammoRemaining!.setText(INFINITY);
      } else {
        this.ammoRemaining!.setText(`${this.player.equippedWeapon.ammo.length}`);
      }
      if (this.player.equippedWeapon.isProjectile) {
        const weapon = this.player.equippedWeapon as ProjectileOnlyWeapon<Projectile>;
        this.clipRemaining!.setText(`${weapon.currentClip.ammo.length}`);
      } else {
        this.clipRemaining?.setText('');
      }
      this.keepTextOnCamera(
        this.ammoRemaining!,
        this.ammoRemainingXOffset,
        this.ammoRemainingYOffset,
      );
      this.keepTextOnCamera(
        this.clipRemaining!,
        this.clipRemainingXOffset,
        this.clipRemainingYOffset,
      );
      this.updateKeyCount(KeyType.SMALL);
      this.updateKeyCount(KeyType.MEDIUM);
      this.updateKeyCount(KeyType.LARGE);
    } else {
      this.background?.setVisible(false);
      this.health.forEach((sliver) => sliver.setVisible(false));
      this.texts.forEach((text) => text.setVisible(false));
      this.player.equippedWeapon.displayIcon(false);
      this.ammoRemaining!.setVisible(false);
      this.clipRemaining!.setVisible(false);
    }
  }
}
