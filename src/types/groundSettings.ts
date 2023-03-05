import { ImageConfig } from './imageSettings';

/**
 * The settings for an individual piece of the ground
 */
export interface GroundConfig extends ImageConfig {
  /**
   * Whether or not the ground spans the screen vertically
   *
   * @default false
   */
  spanVertical?: boolean;
  /**
   * Whether or not the ground spans the screen horizontally
   *
   * @default false
   */
  spanHorizontal?: boolean;
  /**
   * The height of the image
   */
  imageHeight: number;
  /**
   * The width of the image
   */
  imageWidth: number;
}

/**
 * The settings for all of the pieces of ground in the level
 */
export interface GroundSettings {
  /**
   * The key name for the piece of ground and the settings attached to it
   */
  [key: string]: GroundConfig;
}
