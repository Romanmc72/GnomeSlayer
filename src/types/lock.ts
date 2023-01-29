import { IKey, KeyType } from './key';
import { SpriteContainer } from './spriteContainer';
import Player from '../characters/player';

/**
 * The interface for properties of a lock
 */
export interface ILock<T extends KeyType> extends SpriteContainer {
  /**
   * The Key type that fits this lock
   */
  type: T;
  /**
   * Whether or not the lock is currently locked
   */
  isLocked: boolean;
  /**
   * Locks the lock
   * @returns Nothing
   */
  lock: () => void;
  /**
   * Unlocks the lock
   * @param key - The key that can unlock the lock
   * @returns Nothing
   */
  unlock: (player: Player) => void;
  /**
   * Tests if a key can unlock the lock
   * @param key - The key to test with
   * @returns - Whether or not the key can unlock the lock
   */
  canUnlock: (player: Player) => boolean;
}
