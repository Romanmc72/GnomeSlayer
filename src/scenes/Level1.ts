import Phaser from 'phaser';
import Player from '../characters/player';
import SmolGnome from '../characters/smolGnome';

export const LEVEL_1_NAME = 'Level1';

export default class Level1 extends Phaser.Scene {
  private player: Player;

  private gnomes: SmolGnome[];

  private colliders: {[gnome: number]: Phaser.Physics.Arcade.Collider} = {};

  private groundName = 'ground';

  private gnomeCount = 1;

  constructor() {
    super(LEVEL_1_NAME);
    this.player = new Player({ scene: this, x: 0, y: 0 });
    this.gnomes = [];
    for (let gnomeCount = 0; gnomeCount < this.gnomeCount; gnomeCount += 1) {
      this.gnomes.push(new SmolGnome(this, 200 + (10 * gnomeCount), 0, gnomeCount));
    }
  }

  preload() {
    this.player.preload();
    this.gnomes.forEach((gnome) => gnome.preload());
    this.load.image(this.groundName, 'assets/dirt.png');
  }

  create() {
    this.player.create();
    this.gnomes.forEach((gnome) => gnome.create());
    const ground = this.physics.add.staticGroup();
    ground.create(400, 475, this.groundName);

    if (!(this.player.sprite) || !(this.player.equippedWeapon.sprite)) {
      throw new Error('Object used before creation');
    }

    this.gnomes.forEach((gnome) => {
      this.colliders[gnome.id] = this.physics.add.collider(
        this.player.sprite!,
        gnome.sprite!,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_o1, _o2) => gnome.attack(this.player),
      );
      this.physics.add.overlap(
        this.player.equippedWeapon.sprite!,
        gnome.sprite!,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_o1, _o2) => {
          this.player.equippedWeapon.onHit(gnome);
          if (!gnome.isAlive) {
            this.colliders[gnome.id].active = false;
          }
        },
      );
      this.physics.add.collider(ground, gnome.sprite!);
    });
    this.physics.add.collider(ground, this.player.sprite!);
  }

  update() {
    this.player.update();
    this.gnomes.forEach((gnome) => gnome.update());
  }
}
