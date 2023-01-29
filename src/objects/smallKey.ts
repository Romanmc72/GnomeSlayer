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
}

/**
 * The properties for a small key that is being carried
 */
export interface CarriedSmallKeyProps extends SmallKeyProps {
  /**
   * The one carrying the key. If not specified the x and y must be specified.
   */
  carrier: KeyCarrier;
}

/**
 * The properties for a small key that is loose on the scene
 */
export interface LooseSmallKeyProps extends SmallKeyProps {
  /**
   * The X position of the key
   */
  x: number;
  /**
   * The y position of the key
   */
  y: number;
}

/**
 * A small key that can fit small locks
 */
export default class SmallKey extends Key {
  constructor(props: CarriedSmallKeyProps | LooseSmallKeyProps) {
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
