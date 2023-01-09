import Phaser from 'phaser';
import config from './config';
import Menu from './scenes/Menu';
import Level1 from './scenes/Level1';

const game = new Phaser.Game(
  Object.assign(config, {
    scene: [
      Menu,
      Level1,
    ],
  }),
);

export default game;
