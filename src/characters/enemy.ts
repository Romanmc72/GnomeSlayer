import { SpriteContainer } from '../types';
import Weapon from '../weapons/weapon';
import Player from './player';

interface Enemy extends SpriteContainer {
  health: number;
  name: string;
  attackDamage: number;
  weapon?: Weapon;
  attack: (player: Player) => void;
  // block: () => void;
  takeDamage: (damage: number) => void;
  isImmune: (weapon: Weapon) => boolean;
  die: () => void;
}

export default Enemy;
