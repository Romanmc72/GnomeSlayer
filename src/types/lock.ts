import { IKey } from './key';
import { SpriteContainer } from './spriteContainer';

export interface Lock<T extends IKey> extends SpriteContainer {
  type: T;
  isLocked: boolean;
  lock: () => void;
  unlock: (key: T) => void;
  canUnlock: (key: IKey) => boolean;
}
