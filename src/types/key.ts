import { SpriteContainer } from './spriteContainer';
import { Enemy } from './enemy';
import Player from '../characters/player';

/**
 * The different types of keys that can
 * unlock different types of locks
 */
export enum KeyType {
  SMALL,
  MEDIUM,
  LARGE,
}

export type KeyCarrier = Enemy | Player;

export interface IKey extends SpriteContainer {
  /**
   * The type of lock that this key can unlock
   */
  type: KeyType;
  /**
   * The one who carries the key (if it is indeed being carried)
   */
  carrier?: KeyCarrier;
  setCarrier: (carrier: KeyCarrier) => void;
}
