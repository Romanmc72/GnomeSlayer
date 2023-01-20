import Phaser from 'phaser';
import Player from '../characters/player';
import MenuItem from '../objects/menuItem';
import { LEVEL_1_NAME } from './Level1';
import PlayerError from '../errors/player';
import MenuItemError from '../errors/menuItem';
import { Enemy, Level } from '../types';
import { SpriteContainer } from '../types/spriteContainer';

const TITLE_NAME = 'title';
const GUY_SIZE = 24;

export default class Menu extends Phaser.Scene implements Level {
  private gameOver = false;

  private frameRate = 20;

  public player: Player;

  public ground?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

  public gnomes: Enemy[] = [];

  public objects: SpriteContainer[] = [];

  private start: MenuItem;

  private quit: MenuItem;

  public selectedItem?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

  constructor() {
    super('Menu');
    this.player = new Player({ scene: this, x: 0, y: 0 });
    this.start = new MenuItem(
      this,
      112,
      300,
      'start',
      'start',
      48,
      224,
      () => this.scene.start(LEVEL_1_NAME),
    );
    this.quit = new MenuItem(
      this,
      300,
      400,
      'quit',
      'quit',
      48,
      176,
      () => {
        this.player.die();
        this.gameOver = true;
      },
    );
  }

  /**
   * Pre loads static image assets for use as characters, background, and environment
   */
  preload() {
    this.player.preload();
    this.start.preload();
    this.quit.preload();
    this.load.spritesheet(
      TITLE_NAME,
      `assets/${TITLE_NAME}.png`,
      { frameWidth: 1024, frameHeight: 92 },
    );
  }

  /**
   * Sets up characters and animations within the game as well as keyboard bindings
   */
  create() {
    this.player.create();
    this.player.HeadsUpDisplay.isVisible = false;
    this.start.create();
    this.quit.create();
    // Need a static sprite to animate it instead of a static group
    this.ground = this.physics.add.staticSprite(256 + GUY_SIZE, 100, TITLE_NAME);
    // Oddly enough, the dimensions of the body and the visual scale do not
    // work together, and they must be set in this order to work.
    this.ground.setBodySize(512, 46);
    this.ground.setScale(0.5);
    this.anims.create({
      key: TITLE_NAME,
      frames: this.anims.generateFrameNumbers(TITLE_NAME, {
        start: 0,
        end: 15,
      }),
      frameRate: this.frameRate / 8,
      repeat: -1,
      yoyo: true,
    });

    if (!(this.player.sprite)) {
      throw new PlayerError('Player not initialized!');
    }
    if (!(this.start.sprite) || !(this.quit.sprite)) {
      throw new MenuItemError('Player not initialized!');
    }

    this.player.createColliders();
    this.physics.add.collider(this.player.sprite, this.ground);
    this.physics.add.collider(
      this.player.sprite,
      this.start.sprite,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_o1, _o2) => this.start.onCollide(),
    );
    this.physics.add.collider(
      this.player.sprite,
      this.quit.sprite,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_o1, _o2) => this.quit.onCollide(),
    );
  }

  /**
   * The main event loop for the game
   */
  update(): void {
    if (!(this.ground)) {
      throw new Error('Need to define the ground!');
    }

    if (this.gameOver) {
      this.player.die();
    }

    this.player.update();
    this.start.update();
    this.quit.update();
    this.ground.anims.play(TITLE_NAME, true);

    if (this.player.sprite?.body.touching.none) {
      this.start.isSelected = false;
      this.quit.isSelected = false;
    }

    if (this.player.cursor?.space.isDown && this.quit.isSelected) {
      this.quit.select();
    }

    if (this.player.cursor?.space.isDown && this.start.isSelected) {
      this.start.select();
    }

    const feetPosition = (this.player.sprite?.body.position.y ?? 0)
      + (this.player.sprite?.height ?? 0);
    if (feetPosition === this.physics.world.bounds.bottom) {
      this.player.sprite?.setY(0);
    }
  }
}
