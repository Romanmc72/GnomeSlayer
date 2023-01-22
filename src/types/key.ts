import { SpriteContainer } from './spriteContainer';

/**
 * The different types of keys that can
 * unlock different types of locks
 */
export enum KeyType {
  SMALL,
  MEDIUM,
  LARGE,
}

export interface Key extends SpriteContainer {
  /**
   * The type of lock that this key can unlock
   */
  type: KeyType;
}
