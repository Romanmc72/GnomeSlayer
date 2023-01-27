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

/**
 * Types of things that can carry a key
 */
export type KeyCarrier = Enemy | Player;

/**
 * The generic key interface, all keys should implement this interface
 */
export interface IKey extends SpriteContainer {
  /**
   * The type of lock that this key can unlock
   */
  type: KeyType;
  /**
   * The one who carries the key if it is being carried. If it is not being
   * carried this will be undefined.
   *
   * @default undefined
   */
  carrier?: KeyCarrier;
  /**
   * Assign a particular carrier to the key so that it is "picked up"
   * @param carrier - The one who carries the key
   * @returns - Nothing
   */
  setCarrier: (carrier: KeyCarrier) => void;
}
