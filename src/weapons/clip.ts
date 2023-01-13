import { Projectile } from '../types';

export default class Clip<T extends Projectile> {
  public ammo: T[] = [];

  public isEmpty(): boolean {
    return this.ammo.length === 0;
  }

  public fire(): T | undefined {
    return this.ammo.pop();
  }

  public addProjectile(projectile: T) {
    this.ammo.push(projectile);
  }

  public update(): void {
    this.ammo.forEach((projectile: T) => projectile.update());
  }
}
