import { ILevel } from '../types';
import Player from '../characters/player';
import { DEFAULT_DEPTH, INFINITY } from '../constants';
import { MeleeOnlyWeapon } from '../generics';

export interface FistProps {
  /**
   * The scene for this fist
   */
  scene: ILevel;
  /**
   * The player wielding the fist
   */
  player: Player;
}

export default class Fist extends MeleeOnlyWeapon {
  constructor(props: FistProps) {
    super({
      name: 'fist',
      spritesheet: 'fist',
      meleeDamage: 10,
      blowback: 300,
      frameHeight: 20,
      frameWidth: 24,
      frameRate: 12,
      iconName: 'fistIcon',
      idleFrames: 1,
      fireFrames: 6,
      rateOfFire: 0.5,
      ammo: INFINITY,
      depth: DEFAULT_DEPTH,
      canDrop: false,
      x: 0,
      y: 0,
      player: props.player,
      scene: props.scene,
    });
  }
}
