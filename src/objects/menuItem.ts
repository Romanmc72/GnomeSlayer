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
  }

  createColliders(): void {
    this.scene.physics.add.collider(
      this.scene.player.sprite!,
      this.sprite!,
      () => this.onCollide(),
    );
  }

  public update() {
    if (!(this.sprite)) {
      throw new MenuItemError(
        'Required MenuItem attributes not set, call MenuItem.create()'
        + ' before using this method',
      );
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
