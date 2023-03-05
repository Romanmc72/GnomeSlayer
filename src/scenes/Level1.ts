import SmolGnome from '../characters/smolGnome';
import Pistol from '../weapons/pistol';
import RedDoor from '../objects/redDoor';
import { LEVEL_2_NAME } from './Level2';
import SmallKey from '../objects/smallKey';
import SmallLock from '../objects/smallLock';
import Health from '../powerups/health';
import { Level } from '../generics';

export const LEVEL_1_NAME = 'No Way Gnome';

export default class Level1 extends Level {
  private gnomeCount = 3;

  constructor() {
    const width = 1000;
    const height = 500;
    super({
      levelName: LEVEL_1_NAME,
      gameWidth: width,
      gameHeight: height,
      groundConfig: {
        ground: {
          imageFile: 'dirt',
          x: 0,
          y: height,
          spanHorizontal: true,
          imageHeight: 50,
          imageWidth: 800,
        },
        leftWall: {
          imageFile: 'wall',
          x: 0,
          y: 0,
          spanVertical: true,
          imageHeight: 500,
          imageWidth: 100,
        },
        rightWall: {
          imageFile: 'wall',
          x: width,
          y: 0,
          spanVertical: true,
          imageHeight: 500,
          imageWidth: 100,

        },
      },
      backgroundConfig: {
        controls: {
          imageFile: 'controls',
          x: 400,
          y: 150,
        },
      },
      playerX: 100,
      playerY: 0,
    });
    this.addObject(new Pistol({
      scene: this,
      currentClip: 10,
      ammo: 100,
      x: 300,
      y: 0,
    }));
    const door = new RedDoor({
      scene: this,
      nextSceneName: LEVEL_2_NAME,
      x: this.getWidth() - 400,
      y: this.getHeight() - 100,
    });
    const lock = new SmallLock({ lockedObject: door });
    this.addObject(door);
    this.addObject(lock);
    for (let gnomeCount = 0; gnomeCount < this.gnomeCount; gnomeCount += 1) {
      this.gnomes.push(new SmolGnome({
        scene: this,
        x: 200 + (10 * gnomeCount),
        y: 0,
      }));
    }
    this.addObject(new SmallKey({
      scene: this,
      carrier: this.gnomes[0],
      x: 0,
      y: 0,
    }));
    this.addObject(new Health({
      scene: this,
      carrier: this.gnomes[2],
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
}
