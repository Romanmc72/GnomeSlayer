import { KeyType, Level, ILock } from '../types';
import { Door, DoorState } from '../generics';

export interface RedDoorProps {
  scene: Level;
  nextSceneName: string;
  x: number;
  y: number;
  lock?: ILock<KeyType>;
}

export default class RedDoor extends Door {
  constructor(props: RedDoorProps) {
    super({
      ...props,
      name: 'door',
      spritesheet: 'door',
      closedFrame: 0,
      openFrame: 6,
      frameWidth: 40,
      frameHeight: 40,
      frameRate: 3,
      state: props.lock !== undefined ? DoorState.LOCKED : DoorState.CLOSED,
      stateChangeTimer: 2000,
    });
  }
}
