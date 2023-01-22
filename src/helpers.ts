/**
 * A series of helper functions that are frequently used
 */
import { IMAGES_LOCATION } from './constants';

/**
 * Given the name of the image file, receive its location
 * @param imageName - The name of the file without the suffix
 * @returns - The location of the image to load
 */
export default function imageLocationFor(imageName: string): string {
  return `${IMAGES_LOCATION}${imageName}.png`;
}
