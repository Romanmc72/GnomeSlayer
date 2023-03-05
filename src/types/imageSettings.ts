/**
 * A generic static image to initialize
 */
export interface ImageConfig {
  /**
   * The x position of the image
   */
  x: number;
  /**
   * The y position of the image
   */
  y: number;
  /**
   * The image file for the image (minus the png extension)
   */
  imageFile: string;
}

/**
 * The key-value mapping for all of the various images in a scene
 */
export interface ImageSettings {
  /**
   * The key representing the name of this image and the value for
   * its individual settings
   */
  [key: string]: ImageConfig;
}
