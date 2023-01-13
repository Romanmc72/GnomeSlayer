import Phaser from 'phaser';
import Player from '../characters/player';
import SmolGnome from '../characters/smolGnome';
import Pistol from '../weapons/pistol';
import { Enemy } from '../types';

export const LEVEL_1_NAME = 'Level1';

export interface Level extends Phaser.Scene {
  player: Player;
  gnomes: Enemy[];
  ground?: Phaser.Physics.Arcade.StaticGroup;
  colliders: {[gnome: number]: Phaser.Physics.Arcade.Collider};
}

export default class Level1 extends Phaser.Scene implements Level {
  public player: Player;

  public gnomes: SmolGnome[];

  public ground?: Phaser.Physics.Arcade.StaticGroup;

  private gun: Pistol;

  public colliders: {[gnome: number]: Phaser.Physics.Arcade.Collider} = {};

  private groundName = 'ground';

  private gnomeCount = 30;

  private controlsName = 'controls';

  constructor() {
    super(LEVEL_1_NAME);
    this.player = new Player({ scene: this, x: 0, y: 0 });
    this.gun = new Pistol({
      scene: this,
      player: this.player,
      currentClip: 10,
      ammo: 100,
    });
    this.player.weapons.push(this.gun);
    this.gnomes = [];
    for (let gnomeCount = 0; gnomeCount < this.gnomeCount; gnomeCount += 1) {
      this.gnomes.push(new SmolGnome(this, 200 + (10 * gnomeCount), 0, gnomeCount));
    }
  }

  preload() {
    this.player.preload();
    this.gnomes.forEach((gnome) => gnome.preload());
    this.load.image(this.groundName, 'assets/dirt.png');
    this.load.image(this.controlsName, `assets/${this.controlsName}.png`);
  }

  create() {
    this.physics.add.staticImage(400, 150, this.controlsName);
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 475, this.groundName);
    this.player.create();
    this.gnomes.forEach((gnome) => gnome.create());

    if (!(this.player.sprite) || !(this.player.equippedWeapon.sprite)) {
      throw new Error('Object used before creation');
    }
  }

  update() {
    this.player.update();
    this.gnomes.forEach((gnome) => gnome.update());
  }
}
