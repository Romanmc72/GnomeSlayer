import Phaser from 'phaser';
import Player from '../characters/player';
import {
  Enemy,
  GroundSettings,
  ILevel,
  ImageSettings,
  IntraLevelData,
  ISpriteContainer,
} from '../types';
import imageLocationFor from '../helpers';
import { DEFAULT_DEPTH } from '../constants';

export const LEVEL_1_NAME = 'No Way Gnome';

export interface LevelProps {
  /**
   * The name of the level
   */
  levelName: string;
  /**
   * The width of the level
   */
  gameWidth: number;
  /**
   * The height of the level
   */
  gameHeight: number;
  /**
   * The configuration for the ground, these will be interactive
   */
  groundConfig: GroundSettings;
  /**
   * The configuration for the background images, these will be non-interactive
   */
  backgroundConfig?: ImageSettings;
  /**
   * The x position will the player will spawn
   */
  playerX: number;
  /**
   * The y position will the player will spawn
   */
  playerY: number;
}

export class Level extends Phaser.Scene implements ILevel {
  public player: Player;

  public gnomes: Enemy[] = [];

  private groundConfig: GroundSettings;

  private backgroundConfig?: ImageSettings;

  public ground?: Phaser.Physics.Arcade.StaticGroup;

  private objects: ISpriteContainer[] = [];

  private playerX: number;

  private playerY: number;

  private gameWidth: number;

  private gameHeight: number;

  constructor(props: LevelProps) {
    super(props.levelName);
    this.gameHeight = props.gameHeight;
    this.gameWidth = props.gameWidth;
    this.playerX = props.playerX;
    this.playerY = props.playerY;
    this.groundConfig = props.groundConfig;
    this.backgroundConfig = props.backgroundConfig;
    this.player = new Player({ scene: this, x: props.playerX, y: props.playerY });
  }

  /**
   * Initializes the player using settings from the level that triggered this level
   * @param data The properties that a player will retain between levels
   */
  init(data: IntraLevelData) {
    if (data.player) {
      this.player = new Player({
        ...data.player,
        scene: this,
        x: this.playerX,
        y: this.playerY,
      });
    }
  }

  /**
   * Getter method for the game's height
   * @returns The max height of the game
   */
  getHeight(): number {
    return this.gameHeight;
  }

  /**
   * Getter method for the game's width
   * @returns The max width of the game
   */
  getWidth(): number {
    return this.gameWidth;
  }

  /**
   * Adds an object to the array of game objects
   * @param object - The object to add
   */
  addObject(object: ISpriteContainer): void {
    this.objects.push(object);
  }

  /**
   * Start the next scene and pass data along
   * @param data The data to pass to the next level
   */
  nextLevel(levelName: string, data?: IntraLevelData): void {
    this.scene.start(levelName, data);
  }

  /**
   * Load all of the image assets for the level
   */
  preload() {
    this.player.preload();
    this.gnomes.forEach((gnome) => gnome.preload());
    this.objects.forEach((object) => object.preload());
    Object.keys(this.groundConfig).forEach(
      (config: string) => {
        this.load.image(
          config,
          imageLocationFor(this.groundConfig[config].imageFile),
        );
      },
    );
    if (this.backgroundConfig) {
      Object.keys(this.backgroundConfig).forEach(
        (config: string) => {
          this.load.image(
            config,
            imageLocationFor(this.backgroundConfig![config].imageFile),
          );
        },
      );
    }
  }

  /**
   * Create all of the objects for the level and their interactions
   */
  create() {
    this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);
    this.ground = this.physics.add.staticGroup();
    Object.keys(this.groundConfig).forEach((key: string) => {
      const config = this.groundConfig[key];
      if (config.spanHorizontal) {
        const chunks = Math.ceil(this.gameWidth / config.imageWidth);
        for (let chunk = 0; chunk < chunks + 1; chunk += 1) {
          this.ground!.create(config.imageWidth * chunk, config.y, key);
        }
      } else if (config.spanVertical) {
        const chunks = Math.ceil(this.gameHeight / config.imageHeight);
        for (let chunk = 0; chunk < chunks + 1; chunk += 1) {
          this.ground!.create(config.x, config.imageHeight * chunk, key);
        }
      } else {
        this.ground!.create(config.x, config.y, key);
      }
    });
    if (this.backgroundConfig) {
      Object.keys(this.backgroundConfig).forEach(
        (key: string) => {
          const config = this.backgroundConfig![key];
          const image = this.physics.add.staticImage(config.x, config.y, key);
          image.setDepth(-1 * DEFAULT_DEPTH);
        },
      );
    }
    this.player.create();
    this.cameras.main.setBounds(0, 0, this.gameWidth, this.gameHeight);
    this.cameras.main.startFollow(this.player.sprite!, false, 0.02, 0.25);
    this.gnomes.forEach((gnome) => gnome.create());
    this.objects.forEach((object) => object.create());
    this.player.createColliders();
    this.gnomes.forEach((gnome) => gnome.createColliders());
    this.objects.forEach((object) => object.createColliders());
  }

  /**
   * Play the level frame by frame
   */
  update() {
    this.player.update();
    this.gnomes.forEach((gnome) => gnome.update());
    this.objects.forEach((object) => object.update());
  }
}
