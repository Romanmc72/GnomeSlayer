import Phaser from 'phaser';
import Player from '../characters/player';
import { Enemy, Level, SpriteContainer } from '../types';

export const LEVEL_2_NAME = 'LEVEL_2';

export default class Level2 extends Phaser.Scene implements Level {
  public player: Player;

  public gnomes: Enemy[] = [];

  public objects: SpriteContainer[] = [];

  constructor() {
    super(LEVEL_2_NAME);
    this.player = new Player({
      x: 0,
      y: 0,
      scene: this,
    });
  }

  preload() {
    this.player.preload();
  }

  create() {
    this.player.create();
    this.player.createColliders();
  }

  update() {
    this.player.update();
  }
}
