import { KeyCarrier, KeyType, Level } from '../types';
import Key from './key';

/**
 * The properties required for the all small keys
 */
export interface SmallKeyProps {
  /**
   * The scene that the key is a part of
   */
  scene: Level;
  /**
   * The X position of the key
   */
  x: number;
  /**
   * The y position of the key
   */
  y: number;
  /**
   * The one carrying the key. If not specified the x and y must be specified.
   * If specified it will override the x and y values.
   */
  carrier?: KeyCarrier;
}

/**
 * A small key that can fit small locks
 */
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
      spinningFrames: 5,
      x: props.x,
      y: props.y,
    });
  }
}
