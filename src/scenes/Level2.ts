import Player from '../characters/player';
import { Enemy, ISpriteContainer } from '../types';
import { Level } from '../generics';

export const LEVEL_2_NAME = 'LEVEL_2';

export default class Level2 extends Level {
  constructor() {
    super({
      levelName: LEVEL_2_NAME,
      gameHeight: 500,
      gameWidth: 1000,
      playerX: 0,
      playerY: 0,
      groundConfig: {},
    });
  }
}
