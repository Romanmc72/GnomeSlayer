import { Key } from './key';
import { SpriteContainer } from './spriteContainer';

export interface Lock<T extends Key> extends SpriteContainer {
  type: T;
  isLocked: boolean;
  lock: () => void;
  unlock: (key: T) => void;
  canUnlock: (key: Key) => boolean;
}
