import { SpriteContainer } from './spriteContainer';
import { Weapon } from './weapon';
import Player from '../characters/player';

export interface Enemy extends SpriteContainer {
  health: number;
  name: string;
  attackDamage: number;
  weapon?: Weapon;
  jump: number;
  attack: (player: Player) => void;
  // block: () => void;
  takeDamage: (damage: number) => void;
  isImmune: (weapon: Weapon) => boolean;
  die: () => void;
}
