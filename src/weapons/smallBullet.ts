import { ILevel, Weapon } from '../types';
import { Projectile } from '../generics';

export interface SmallBulletProps {
  scene: ILevel;
  weapon: Weapon;
}

export default class SmallBullet extends Projectile {
  constructor(props: SmallBulletProps) {
    super({
      scene: props.scene,
      weapon: props.weapon,
      name: 'smallBullet',
      spritesheet: 'smallBullet',
      velocity: 600,
      damage: 10,
      range: 300,
      gravity: 0,
      launchedFrames: 1,
      frameWidth: 19,
      frameHeight: 6,
    });
  }
}
