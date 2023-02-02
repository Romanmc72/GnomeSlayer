import { KeyType } from './key';
import { SpriteContainer } from './spriteContainer';

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
   * Unlocks the lock if it can be done
   * @returns Nothing
   */
  unlock: () => void;
  /**
   * Tests if a lock can be unlocked
   * @returns - Whether or not the player in the scene has the keys to unlock
   */
  canUnlock: () => boolean;
}
