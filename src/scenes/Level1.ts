import Phaser from 'phaser';
import Player from '../characters/player';
import SmolGnome from '../characters/smolGnome';
import Pistol from '../weapons/pistol';
import { Level, SpriteContainer } from '../types';

export const LEVEL_1_NAME = 'Level1';

export default class Level1 extends Phaser.Scene implements Level {
  public player: Player;

  public gnomes: SmolGnome[];

  public ground?: Phaser.Physics.Arcade.StaticGroup;

  public objects: SpriteContainer[] = [];

  private gun: Pistol;

  private groundName = 'ground';

  private gnomeCount = 36;

  private controlsName = 'controls';

  constructor() {
    super(LEVEL_1_NAME);
    this.player = new Player({ scene: this, x: 0, y: 0 });
    this.gun = new Pistol({
      scene: this,
      currentClip: 10,
      ammo: 100,
      x: 300,
      y: 0,
    });
    this.player.addWeapon(this.gun);
    this.gnomes = [];
    for (let gnomeCount = 0; gnomeCount < this.gnomeCount; gnomeCount += 1) {
      this.gnomes.push(new SmolGnome(this, 200 + (10 * gnomeCount), 0, gnomeCount));
    }
  }

  preload() {
    this.player.preload();
    this.gnomes.forEach((gnome) => gnome.preload());
    this.objects.forEach((object) => object.preload());
    this.load.image(this.groundName, 'assets/dirt.png');
    this.load.image(this.controlsName, `assets/${this.controlsName}.png`);
  }

  create() {
    this.physics.add.staticImage(400, 150, this.controlsName);
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 475, this.groundName);
    this.player.create();
    this.gnomes.forEach((gnome) => gnome.create());
    this.objects.forEach((object) => object.create());

    if (!(this.player.sprite) || !(this.player.equippedWeapon.sprite)) {
      throw new Error('Object used before creation');
    }
  }

  update() {
    this.player.update();
    this.gnomes.forEach((gnome) => gnome.update());
    this.objects.forEach((object) => object.update());
  }
}
