import Phaser from 'phaser';
import Player from '../characters/player';

export const LEVEL_1_NAME = 'Level1';

export default class Level1 extends Phaser.Scene {
  private player: Player;

  constructor() {
    super(LEVEL_1_NAME);
    this.player = new Player(this, 0, 0);
  }

  preload() {
    this.player!.preload();
  }

  create() {
    this.player!.create();
  }

  update() {
    this.player!.update();
  }
}
