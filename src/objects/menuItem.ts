import MenuItemError from '../errors/menuItem';
import { SpriteContainer } from '../generics';
import { DEFAULT_DEPTH } from '../constants';
import { SpriteContainerProps } from '../types';

/**
 * The animation states available to a menu item
 */
export enum MenuItemAnimations {
  SELECTED = 'selected',
  DESELECTED = 'deselected',
}

/**
 * The properties required to initialize a menu item
 */
export interface MenuItemProps extends Omit<SpriteContainerProps, 'animationSettings' | 'depth'> {
  /**
   * The action to perform when the menu item is selected
   * @returns Nothing
   */
  select: () => void,
}

export default class MenuItem extends SpriteContainer {
  public isSelected = false;

  public select: () => void;

  private xCoordinate: number;

  private yCoordinate: number;

  constructor(props: MenuItemProps) {
    super({
      ...props,
      animationSettings: {
        [MenuItemAnimations.SELECTED]: {
          frameStart: 1,
          frameEnd: 1,
        },
        [MenuItemAnimations.DESELECTED]: {
          frameStart: 0,
          frameEnd: 0,
        },
      },
      depth: DEFAULT_DEPTH + 2,
    });
    this.select = props.select;
    this.xCoordinate = props.x;
    this.yCoordinate = props.y;
  }

  createColliders(): void {
    this.scene.physics.add.collider(
      this.scene.player.sprite!,
      this.sprite!,
      () => this.onCollide(),
    );
  }

  public update() {
    this.sprite!.setImmovable(true);
    this.sprite!.setVelocity(0, 0);
    this.sprite!.setGravity(0, 0);
    this.sprite!.setX(this.xCoordinate);
    this.sprite!.setY(this.yCoordinate);
    if (!(this.sprite)) {
      throw new MenuItemError(
        'Required MenuItem attributes not set, call MenuItem.create()'
        + ' before using this method',
      );
    }

    if (!this.sprite!.body.touching.up) {
      this.isSelected = false;
    }

    if (this.isSelected) {
      this.sprite.anims.play(this.getAnimationName(MenuItemAnimations.SELECTED), true);
    } else {
      this.sprite.anims.play(this.getAnimationName(MenuItemAnimations.DESELECTED), true);
    }
  }

  public onCollide() {
    this.isSelected = true;
  }
}
