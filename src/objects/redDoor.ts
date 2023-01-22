import { Level } from '../types';
import Door, { DoorState } from './door';

export interface RedDoorProps {
  scene: Level;
  nextSceneName: string;
  x: number;
  y: number;
}

export default class RedDoor extends Door {
  constructor(props: RedDoorProps) {
    super({
      ...props,
      name: 'door',
      spriteSheet: 'door',
      closedFrame: 0,
      openFrame: 6,
      frameWidth: 40,
      frameHeight: 40,
      frameRate: 3,
      state: DoorState.CLOSED,
      stateChangeTimer: 2000,
    });
  }
}
