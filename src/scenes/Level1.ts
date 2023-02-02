import Phaser from 'phaser';
import Player from '../characters/player';
import SmolGnome from '../characters/smolGnome';
import Pistol from '../weapons/pistol';
import { Level, SpriteContainer } from '../types';
import RedDoor from '../objects/redDoor';
import { LEVEL_2_NAME } from './Level2';
import SmallKey from '../objects/smallKey';
import SmallLock from '../objects/smallLock';
import Health from '../powerups/health';

export const LEVEL_1_NAME = 'No Way Gnome';

export default class Level1 extends Phaser.Scene implements Level {
  public player: Player;

  public gnomes: SmolGnome[];

  public ground?: Phaser.Physics.Arcade.StaticGroup;

  public objects: SpriteContainer[] = [];

  private gameWidth = 1000;

  private gameHeight = 500;

  private groundName = 'ground';

  private wallName = 'wall';

  private gnomeCount = 1;

  private controlsName = 'controls';

  constructor() {
    super(LEVEL_1_NAME);
    this.player = new Player({ scene: this, x: 40, y: 0 });
    this.objects.push(new Pistol({
      scene: this,
      currentClip: 10,
      ammo: 100,
      x: 300,
      y: 0,
    }));
    const door = new RedDoor({
      scene: this,
      nextSceneName: LEVEL_2_NAME,
      x: this.gameWidth - 400,
      y: this.gameHeight - 100,
    });
    const lock = new SmallLock({ lockedObject: door });
    this.objects.push(door);
    this.objects.push(lock);
    this.gnomes = [];
    for (let gnomeCount = 0; gnomeCount < this.gnomeCount; gnomeCount += 1) {
      this.gnomes.push(new SmolGnome(this, 200 + (10 * gnomeCount), 0, gnomeCount));
    }
    this.objects.push(new SmallKey({ scene: this, carrier: this.gnomes[0] }));
    this.objects.push(new Health({
      scene: this,
      carrier: this.gnomes[0],
      healthAmount: 30,
      spinningFrames: 5,
      yoyo: true,
      frameHeight: 20,
      frameWidth: 20,
      name: 'heart',
      spritesheet: 'heart',
      x: 0,
      y: 0,
   }));
  }

  preload() {
    this.player.preload();
    this.gnomes.forEach((gnome) => gnome.preload());
    this.objects.forEach((object) => object.preload());
    this.load.image(this.groundName, 'assets/dirt.png');
    this.load.image(this.controlsName, `assets/${this.controlsName}.png`);
    this.load.image(this.wallName, `assets/${this.wallName}.png`);
  }

  create() {
    this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);
    this.physics.add.staticImage(400, 150, this.controlsName);
    this.ground = this.physics.add.staticGroup();
    const groundWidth = 800;
    const groundStart = -400;
    for (
      let chunk = 0;
      (((chunk - 1) * groundWidth) + groundStart) < this.gameWidth;
      chunk += 1
    ) {
      this.ground.create(-400 + (chunk * groundWidth), 475, this.groundName);
    }
    this.ground.create(-30, 250, this.wallName);
    this.ground.create(this.gameWidth - 30, 250, this.wallName);
    this.player.create();
    this.cameras.main.setBounds(0, 0, this.gameWidth, this.gameHeight);
    this.cameras.main.startFollow(this.player.sprite!, false, 0.02, 0.25);
    this.gnomes.forEach((gnome) => gnome.create());
    this.objects.forEach((object) => object.create());
    this.player.createColliders();
    this.gnomes.forEach((gnome) => gnome.createColliders());
    this.objects.forEach((object) => object.createColliders());
  }

  update() {
    this.player.update();
    this.gnomes.forEach((gnome) => gnome.update());
    this.objects.forEach((object) => object.update());
  }
}
