import Phaser from 'phaser';
import Player from '../characters/player';
import { SpriteContainer } from '../types';
import { WEAPON_ICON_DIMENSIONS } from '../weapons/weapon';

export default class HUD implements SpriteContainer {
  public scene: Phaser.Scene;

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

  constructor(scene: Phaser.Scene, player: Player) {
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

  public create(): void {
    this.background = this.scene.physics.add.staticImage(
      this.x + (this.healthBarWidth / 2) - 2,
      this.y,
      this.healthBarRed,
    );
    for (let healthSliver = 0; healthSliver < 100; healthSliver += 1) {
      this.health.push(
        this.scene.physics.add.staticImage(
          this.x + (this.healthSliverWidth * healthSliver),
          this.y,
          this.healthBarGreen,
        ),
      );
    }
    this.texts.push(
      this.scene.physics.add.staticImage(
        WEAPON_ICON_DIMENSIONS.x,
        WEAPON_ICON_DIMENSIONS.y - 36,
        this.equippedLabel,
      ),
    );
    this.texts.push(
      this.scene.physics.add.staticImage(
        this.x + 24,
        this.y - 16,
        this.healthLabel,
      ),
    );
  }

  public update(): void {
    if (this.isVisible) {
      const playerMaxHealth = 100;
      this.health.slice(0, this.player.health).forEach(
        (sliver) => sliver.setVisible(true),
      );
      this.health.slice(this.player.health, playerMaxHealth).forEach(
        (sliver) => sliver.setVisible(false),
      );
      this.player.weapons.forEach((weapon) => weapon.displayIcon(false));
      this.player.equippedWeapon.displayIcon(true);
    } else {
      this.background?.setVisible(false);
      this.health.forEach((sliver) => sliver.setVisible(false));
      this.texts.forEach((text) => text.setVisible(false));
      this.player.equippedWeapon.displayIcon(false);
    }
  }
}
