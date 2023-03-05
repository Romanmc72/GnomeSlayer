import Phaser from 'phaser';
import Player from '../../characters/player';
import { ISpriteContainer, SpriteContainer, SpriteContainerProps } from '../spriteContainer';
import { IProjectile } from '../projectile';
import { WEAPON_ICON_DIMENSIONS } from '../../constants';
import imageLocationFor from '../../helpers';

/**
 * Represents a weapon whose ammo is  either finite or infinite
 */
export type Infinity = '\u221E';

/**
 * The different types of ammo options for weapons with some number
 * of projectiles, some limited number of uses, or infinite ammo
 */
export type AmmoOptions = IProjectile[] | Infinity | number;

/**
 * The default interface for a given type of weapon
 */
export interface IWeapon extends ISpriteContainer {
  /**
   * The player to which this weapon belongs
   */
  player?: Player;
  /**
   * The function that fires the weapon when called. Should perform both melee
   * and projectile if weapon does both
   * @returns - Nothing
   */
  fire: () => void;
  /**
   * The ammunition for the weapon
   */
  ammo: AmmoOptions;
  /**
   * Whether or not the weapon can currently be fired
   */
  canFire: boolean;
  /**
   * The rate at which the weapon can be fired again, measured in rounds per second
   */
  rateOfFire: number;
  /**
   * Whether or not this weapon can be dropped
   */
  canDrop: boolean;
  /**
   * Whether or not the weapon is dropped
   */
  isDropped: boolean;
  /**
   * The icon for the weapon.
   */
  icon?: Phaser.Physics.Arcade.Image;
  /**
   * Toggle whether or not the icon is displayed
   * @param display - True will display the icon, False will hide it
   * @returns - Nothing
   */
  displayIcon: (display: boolean) => void;
  /**
   * Reloads the weapon with a new clip from the available ammo
   */
  reload: () => void;
  /**
   * Whether or not this is a Melee weapon
   */
  isMelee: boolean;
  /**
   * Whether or not this is a projectile weapon
   */
  isProjectile: boolean;
  /**
   * The function that gets called when a player interacts with this object
   * while it is no yet carried by the player
   */
  interact: (player: Player) => void;
}

/**
 * The properties for instantiating the base weapon type
 */
export interface WeaponBaseProps extends SpriteContainerProps {
  /**
   * The player carrying the weapon
   */
  player?: Player;
  /**
   * The ammo of this weapon
   */
  ammo: AmmoOptions;
  /**
   * How fast the weapon will fire, measured in rounds per second
   */
  rateOfFire: number;
  /**
   * Whether or not this weapon can be dropped once it is picked up
   */
  canDrop: boolean;
  /**
   * Whether or not it has melee capabilities
   */
  isMelee: boolean;
  /**
   * Whether or not it has projectile capabilities
   */
  isProjectile: boolean;
  /**
   * The name of the weapon's icon and it spritesheet
   */
  iconName: string;
}

/**
 * This is a base class for weapons to extend from. Do not use it directly as
 * it does not fully implement the IWeapon interface as there is great
 * variation to the way different weapons work. Instead of trying to generically
 * implement everything, there will be more specific classes that extend this
 * one which can be take and extended directly.
 */
export class WeaponBase extends SpriteContainer implements Omit<
  IWeapon,
  'fire'
  | 'interact'
  | 'reload'
> {
  public player?: Player;

  public ammo: AmmoOptions;

  public canFire = true;

  public rateOfFire: number;

  public canDrop: boolean;

  public isDropped: boolean;

  public isMelee: boolean;

  public isProjectile: boolean;

  public icon?: Phaser.Physics.Arcade.Image;

  private iconName: string;

  constructor(props: WeaponBaseProps) {
    super(props);
    this.player = props.player;
    this.ammo = props.ammo;
    this.canDrop = props.canDrop;
    this.isDropped = this.player === undefined;
    this.isMelee = props.isMelee;
    this.isProjectile = props.isProjectile;
    this.rateOfFire = props.rateOfFire;
    this.iconName = props.iconName;
  }

  preload() {
    super.preload();
    this.scene.load.spritesheet(
      this.iconName,
      imageLocationFor(this.iconName),
      {
        frameWidth: WEAPON_ICON_DIMENSIONS.width,
        frameHeight: WEAPON_ICON_DIMENSIONS.height,
      },
    );
  }

  create(): void {
    super.create();
    this.icon = this.scene.physics.add.staticImage(
      WEAPON_ICON_DIMENSIONS.x,
      WEAPON_ICON_DIMENSIONS.y,
      this.iconName,
    );
    this.icon.depth = WEAPON_ICON_DIMENSIONS.depth;
    this.displayIcon(false);
  }

  displayIcon(display: boolean): void {
    this.icon!.setVisible(display);
  }

  setPlayer(player: Player): void {
    this.isDropped = false;
    this.player = player;
  }
}
