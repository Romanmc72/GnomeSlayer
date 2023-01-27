import { IKey } from './key';
import { SpriteContainer } from './spriteContainer';

/**
 * The interface for properties of a lock
 */
export interface ILock<T extends IKey> extends SpriteContainer {
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
  unlock: (key: T) => void;
  /**
   * Tests if a key can unlock the lock
   * @param key - The key to test with
   * @returns - Whether or not the key can unlock the lock
   */
  canUnlock: (key: IKey) => boolean;
}
