import Lock from './lock';
import Door from './door';
import SmallKey from './smallKey';
import { KeyType } from '../types';

export interface SmallLockProps {
  lockedObject: Door;
}

export default class SmallLock extends Lock<KeyType.SMALL> {
  constructor(props: SmallLockProps) {
    super({
      ...props,
      scene: props.lockedObject.scene,
      name: 'SmallLock',
      spritesheet: 'smallLock',
      frameHeight: 20,
      frameWidth: 12,
      frameRate: 20,
      unlockFrame: 9,
      isLocked: true,
      type: KeyType.SMALL,
    });
  }
}
