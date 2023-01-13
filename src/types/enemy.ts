import Phaser from 'phaser';
import { SpriteContainer } from './spriteContainer';
import { Weapon } from './weapon';
import Player from '../characters/player';

export interface Enemy extends SpriteContainer {
  id: number;
  health: number;
  name: string;
  attackDamage: number;
  weapon?: Weapon;
  jump: number;
  isAlive: boolean;
  attack: (player: Player) => void;
  // block: () => void;
  takeDamage: (damage: number) => void;
  isImmune: (weapon: Weapon) => boolean;
  die: () => void;
}
