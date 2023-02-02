import { ISpriteContainer } from './spriteContainer';

export interface IPowerUp extends ISpriteContainer {
  /**
   * Whether or not this power up has been used
   */
  isUsed: boolean;
  /**
   * The Y velocity speed at which the power up will "pop up" when dropped by
   * an enemy or hit in such a way to make it move up
   */
  popUpHeight: number;
}
