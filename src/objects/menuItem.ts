import Phaser from 'phaser';
import MenuItemError from '../errors/menuItem';
import { SpriteContainer } from '../types/spriteContainer';

export default class MenuItem implements SpriteContainer {
  public scene: Phaser.Scene;

  private x: number;

  private y: number;

  public spriteName: string;

  public spriteSheet: string;

  public frameHeight: number;

  public frameWidth: number;

  public sprite?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

  public isSelected = false;

  private selectedName: string;

  private deselectedName: string;

  public select: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spriteName: string,
    spriteSheet: string,
    frameHeight: number,
    frameWidth: number,
    select: () => void,
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.spriteName = spriteName;
    this.spriteSheet = spriteSheet;
    this.frameHeight = frameHeight;
    this.frameWidth = frameWidth;
    this.selectedName = `${this.spriteName}Selected`;
    this.deselectedName = `${this.spriteName}Deselected`;
    this.select = select;
  }

  public preload() {
    this.scene.load.spritesheet(
      this.spriteName,
      `assets/${this.spriteSheet}.png`,
      { frameWidth: this.frameWidth, frameHeight: this.frameHeight },
    );
  }

  public create() {
    this.sprite = this.scene.physics.add.staticSprite(this.x, this.y, this.spriteName);
    this.scene.anims.create({
      key: this.selectedName,
      frames: this.scene.anims.generateFrameNumbers(this.spriteName, {
        start: 1,
        end: 1,
      }),
      repeat: 0,
    });
    this.scene.anims.create({
      key: this.deselectedName,
      frames: this.scene.anims.generateFrameNumbers(this.spriteName, {
        start: 0,
        end: 0,
      }),
      repeat: 0,
    });
  }

  public update() {
    if (!(this.sprite)) {
      throw new MenuItemError(
        'Required MenuItem attributes not set, call MenuItem.create()'
        + ' before using this method',
      );
    }

    if (this.isSelected) {
      this.sprite.anims.play(this.selectedName, true);
    } else {
      this.sprite.anims.play(this.deselectedName, true);
    }
  }

  public onCollide() {
    this.isSelected = true;
  }
}
