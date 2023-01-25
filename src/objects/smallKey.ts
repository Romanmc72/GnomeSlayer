import { KeyCarrier, KeyType, Level } from '../types';
import Key from './key';

export interface SmallKeyProps {
  scene: Level;
  carrier?: KeyCarrier;
  x?: number;
  y?: number;
}

export default class SmallKey extends Key {
  constructor(props: SmallKeyProps) {
    super({
      ...props,
      type: KeyType.SMALL,
      name: 'smallKey',
      spritesheet: 'key',
      frameHeight: 17,
      frameWidth: 12,
      frameRate: 10,
      stillFrame: 0,
      spinningFrames: 5,
    });
  }
}
