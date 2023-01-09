import Phaser from 'phaser';
import Player from '../characters/player';
import Weapon from '../weapons/weapon';
import { SpriteContainer } from '../types';

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
    } else {
      this.background?.setVisible(false);
      this.health.forEach((sliver) => sliver.setVisible(false));
    }
  }
}
