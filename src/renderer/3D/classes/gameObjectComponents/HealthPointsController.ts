import { GameObject, GameObjectComponent, logger } from '@tgdf';

export class HealthPointsController extends GameObjectComponent {
  private _healthPoints: number;
  private _initialHealthPoints: number;
  private _isDead: boolean = false;

  constructor(gameObject: GameObject, initialHealthPoints: number = 100) {
    super(gameObject);
    this._initialHealthPoints = initialHealthPoints;
    this._healthPoints = initialHealthPoints;
  }

  public get healthPoints(): number {
    return this._healthPoints;
  }

  public get initialHealthPoints(): number {
    return this._initialHealthPoints;
  }

  public get isDead(): boolean {
    return this._isDead;
  }

  public inflictDamage(amount: number): void {
    if (amount < 0) {
      logger({
        message: '[HealthPointsController] Damage amount must be positive',
        type: 'warn',
      });
      return;
    }
    this._healthPoints = Math.max(this._healthPoints - amount, 0);
    this._isDead = this._healthPoints === 0;

    this.onDamageTaken();
    if (this._isDead) {
      this.onDeath();
    }
  }

  public healDamage(amount: number): void {
    if (amount < 0) {
      logger({
        message: '[HealthPointsController] Heal amount must be positive',
        type: 'warn',
      });
      return;
    }
    // Allow overhealing
    this._healthPoints = this._healthPoints + amount;
    this._isDead = this._healthPoints === 0;

    this.onHeal();
  }

  public resetHealth(): void {
    this._healthPoints = this._initialHealthPoints;
    this._isDead = false;

    this.onHeal();
  }

  public onHeal() {}

  public onDamageTaken() {}

  public onDeath() {}
}
