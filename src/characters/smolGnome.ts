import {
  Enemy,
  PartialSpriteContainerProps,
  Weapon,
} from '../types';
import Player from './player';
import { DEFAULT_DEPTH } from '../constants';
import { SpriteContainer } from '../generics';

export enum SmolGnomeAnimations {
  TURN = 'turn',
  RUN = 'run',
  HURT = 'hurt',
  DIE = 'die',
}

export default class SmolGnome extends SpriteContainer implements Enemy {
  public health = 30;

  public jump = 100;

  private jumpProbability = 0.30;

  public attackDamage = 5;

  public isAlive = true;

  private immunities: Weapon[] = [];

  private speed = 50;

  private takingDamage = false;

  private isDoingSomething = false;

  private hitRecoveryPeriodMs = 250;

  public facingRight = false;

  constructor(props: Omit<
    PartialSpriteContainerProps,
    | 'frameWidth'
    | 'frameHeight'
    | 'frameRate'
    | 'name'
    | 'spritesheet'
  >) {
    super({
      ...props,
      name: 'smolGnome',
      spritesheet: 'smolGnome',
      frameHeight: 24,
      frameWidth: 24,
      frameRate: 20,
      animationSettings: {
        [SmolGnomeAnimations.TURN]: {
          frameStart: 1,
          frameEnd: 6,
        },
        [SmolGnomeAnimations.RUN]: {
          frameStart: 7,
          frameEnd: 8,
        },
        [SmolGnomeAnimations.HURT]: {
          frameStart: 0,
          frameEnd: 0,
        },
        [SmolGnomeAnimations.DIE]: {
          frameStart: 9,
          frameEnd: 22,
          frameRate: 5,
          repeat: 0,
        },
      },
      depth: DEFAULT_DEPTH - 1,
    });
  }

  private resetDamage() {
    this.takingDamage = false;
  }

  private resetDoingSomething() {
    this.isDoingSomething = false;
  }

  public attack(player: Player) {
    if (this.isAlive && !player.takingDamage) {
      player.takeDamage(this.attackDamage);
      const blowback = player.gravity / 2;
      player.sprite?.setVelocityY(-1 * blowback);
      if (this.sprite?.body.touching.left) {
        player.sprite?.setVelocityX(-1 * blowback);
      } else if (this.sprite?.body.touching.right) {
        player.sprite?.setVelocityX(blowback);
      } else if (this.sprite?.body.touching.up) {
        player.sprite?.setVelocityX(Math.random() > 0.5 ? blowback : -1 * blowback);
      }
    }
  }

  public takeDamage(damage: number): void {
    if (!this.takingDamage) {
      this.health -= damage;
      this.takingDamage = true;
      this.isDoingSomething = false;
      setTimeout(() => this.resetDamage(), this.hitRecoveryPeriodMs);
      if (this.health <= 0) {
        this.die();
      }
    }
  }

  private damageAnimation() {
    this.isDoingSomething = true;
    setTimeout(() => this.resetDoingSomething(), this.hitRecoveryPeriodMs);
    this.sprite?.setVelocityY(-150);
    if (this.sprite!.body.touching.left) {
      this.facingRight = false;
      this.sprite?.setVelocityX(150);
    } else {
      this.facingRight = true;
      this.sprite?.setVelocityX(-150);
    }
    this.sprite!.anims.play(this.getAnimationName(SmolGnomeAnimations.HURT), true);
  }

  public isImmune(weapon: Weapon): boolean {
    if (this.immunities.includes(weapon)) {
      return true;
    }
    return false;
  }

  public die(): void {
    this.isAlive = false;
    this.disableColliders();
  }

  private andStayDead() {
    this.sprite?.setVelocity(0, 0);
    const animationIndex = (this.sprite?.anims.currentFrame?.index ?? -1 + 1);
    const frameCount = (
      this.animationSettings[SmolGnomeAnimations.DIE].frameEnd
      - this.animationSettings[SmolGnomeAnimations.DIE].frameStart
    );
    if (animationIndex < frameCount) {
      this.sprite?.anims.play(this.getAnimationName(SmolGnomeAnimations.DIE), true);
    } else {
      this.sprite?.anims.pause(this.sprite.anims.currentAnim.frames[-1]);
    }
  }

  public createColliders(): void {
    this.scene.physics.add.collider(this.sprite!, this.scene.ground!);
    this.sprite!.setCollideWorldBounds(true);
    this.colliders.push(
      this.scene.physics.add.collider(
        this.scene.player.sprite!,
        this.sprite!,
        () => {
          this.attack(this.scene.player);
        },
      ),
    );
    this.colliders.push(
      this.scene.physics.add.collider(
        this.scene.player.sprite!,
        this.sprite!,
        () => {
          this.attack(this.scene.player);
        },
      ),
    );
  }

  private runLeft() {
    this.facingRight = false;
    this.sprite?.setVelocityX(this.speed * -1);
    this.sprite?.anims.play(this.getAnimationName(SmolGnomeAnimations.RUN), true);
  }

  private runRight() {
    this.facingRight = true;
    this.sprite?.setVelocityX(this.speed);
    this.sprite?.anims.play(this.getAnimationName(SmolGnomeAnimations.RUN), true);
  }

  private turnRight() {
    this.facingRight = true;
    this.sprite?.setVelocityX(0);
    this.sprite?.anims.play(this.getAnimationName(SmolGnomeAnimations.TURN), true);
  }

  private turnLeft() {
    this.facingRight = false;
    this.sprite?.setVelocityX(0);
    this.sprite?.anims.play(this.getAnimationName(SmolGnomeAnimations.TURN), true);
  }

  public update(): void {
    if (this.isAlive) {
      if (!this.isDoingSomething) {
        if (!this.takingDamage) {
          const seed = Math.random();
          const jumpSeed = Math.random();
          const randomDuration = Math.floor(Math.random() * 1000);
          this.isDoingSomething = true;
          if (seed < 0.25) {
            this.turnLeft();
          } else if (seed < 0.50) {
            this.turnRight();
          } else if (seed < 0.75) {
            this.runLeft();
          } else {
            this.runRight();
          }
          if (jumpSeed <= this.jumpProbability && this.sprite?.body.touching.down) {
            this.sprite?.setVelocityY(-this.jump);
          }
          setTimeout(() => this.resetDoingSomething(), randomDuration);
        } else {
          this.damageAnimation();
        }
      }
    } else {
      this.andStayDead();
    }
    if (this.facingRight) {
      this.sprite!.flipX = false;
    } else {
      this.sprite!.flipX = true;
    }
  }
}
