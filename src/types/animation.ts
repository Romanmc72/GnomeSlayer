/**
 * The configuration for a single animation
 */
export interface AnimationConfig {
  /**
   * The rate at which the frames will play
   *
   * @default DEFAULT_FRAME_RATE
   */
  frameRate?: number;
  /**
   * The first frame for this animation
   */
  frameStart: number;
  /**
   * The last frame for this animation
   */
  frameEnd: number;
  /**
   * How many times this animation repeats. -1 = infinite.
   *
   * @default -1
   */
  repeat?: number;
  /**
   * Whether or not this animation starts over at 0 or plays back reverse before starting over
   *
   * @default false
   */
  yoyo?: boolean;
}

/**
 * The map of animations that a sprite will have
 */
export type AnimationSettings = {
  [animationName: string]: AnimationConfig;
};
