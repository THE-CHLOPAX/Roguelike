import * as THREE from 'three';
import { KeyboardInput, MouseInput, Scene, compareFloats, filterBelow } from '@tgdf';

export type CameraDependencies = {
  options: {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    maxAcceleration?: THREE.Vector3;
    accelerationRate?: number;
    decelerationDamping?: number;
  };
  scene: Scene;
};

const AFTER_ZOOM_TIMEOUT_MS = 300;
const ZOOM_VALUE = 1;

export class Camera extends THREE.PerspectiveCamera {
  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;

  private _isDragging: boolean = false;

  private _direction: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _maxAcceleration: THREE.Vector3 = new THREE.Vector3(15, 15, 15);
  private _accelerationRate: number = 0.8;
  private _decelerationDamping: number = 0.03;

  private _zoomTimeout: NodeJS.Timeout | null = null;

  constructor({ options, scene }: CameraDependencies) {
    super(options.fov, options.aspect, options.near, options.far);

    if (options.maxAcceleration) this._maxAcceleration.copy(options.maxAcceleration);
    if (options.accelerationRate !== undefined) this._accelerationRate = options.accelerationRate;
    if (options.decelerationDamping !== undefined)
      this._decelerationDamping = options.decelerationDamping;

    if (!scene.keyboardInput || !scene.mouseInput) {
      throw new Error('Camera requires keyboardInput and mouseInput dependencies.');
    }

    this.rotation.order = 'YXZ';
    this.up.set(0, 1, 0);

    this._keyboardInput = scene.keyboardInput;
    this._mouseInput = scene.mouseInput;

    scene.events.on('update', this._onUpdate.bind(this));

    this._handleKeyboardInput();
    this._handleMouseInput();
  }

  public set maxAcceleration(maxAcceleration: THREE.Vector3) {
    this._maxAcceleration.copy(maxAcceleration);
  }

  public get maxAcceleration(): THREE.Vector3 {
    return this._maxAcceleration;
  }

  public set accelerationRate(damping: number) {
    this._accelerationRate = damping;
  }

  public get accelerationRate(): number {
    return this._accelerationRate;
  }

  public set decelerationDamping(damping: number) {
    this._decelerationDamping = damping;
  }

  public get decelerationDamping(): number {
    return this._decelerationDamping;
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -1 },
      { key: 'a', axis: 'x' as const, value: -1 },
      { key: 's', axis: 'z' as const, value: 1 },
      { key: 'd', axis: 'x' as const, value: 1 },
      { key: 'Space', axis: 'y' as const, value: 1 },
      { key: 'c', axis: 'y' as const, value: -1 },
    ];

    for (const { key, axis, value } of keyMappings) {
      this._keyboardInput.addKeyPressListener(key, () => {
        this._direction[axis] = value;
      });
      this._keyboardInput.addKeyUpListener(key, () => {
        this._direction[axis] = 0;
      });
    }
  }

  private _handleMouseInput(): void {
    this._mouseInput.addMouseClickListener('left', () => {
      document.body.style.cursor = 'grabbing';
      this._isDragging = true;
    });

    this._mouseInput.addMouseUpListener('left', () => {
      document.body.style.cursor = 'grab';
      this._isDragging = false;
    });

    this._mouseInput.addMouseScrollListener((e: WheelEvent) => {
      const delta = Math.sign(e.deltaY);
      this._direction.z = delta * ZOOM_VALUE;

      if (this._zoomTimeout) {
        clearTimeout(this._zoomTimeout);
      }

      this._zoomTimeout = setTimeout(() => {
        this._direction.z = 0;
        this._zoomTimeout = null;
      }, AFTER_ZOOM_TIMEOUT_MS);
    });

    this._mouseInput.addMouseMoveListener((e: MouseEvent) => {
      if (this._isDragging) {
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.rotation.y -= movementX * 0.002;
        this.rotation.x -= movementY * 0.002;

        // Clamp the vertical rotation to prevent flipping
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
      }
    });
  }

  private _applyAcceleration(direction: THREE.Vector3): void {
    for (const axis of ['x', 'y', 'z'] as const) {
      if (
        direction[axis] < 0 &&
        compareFloats(this._acceleration[axis], 'greater-than', -this._maxAcceleration[axis])
      ) {
        const accelerationRate = this._accelerationRate <= 0 ? 1 : this._accelerationRate;
        this._acceleration[axis] -= accelerationRate;
      }
      if (
        direction[axis] > 0 &&
        compareFloats(this._acceleration[axis], 'less-than', this._maxAcceleration[axis])
      ) {
        const accelerationRate = this._accelerationRate <= 0 ? 1 : this._accelerationRate;
        this._acceleration[axis] += accelerationRate;
      }
      // Stop accelerating forward/backward
      if (direction[axis] === 0) {
        const decelerationDamping =
          this._decelerationDamping <= 0 ? 1 : 1 + this._decelerationDamping;
        this._acceleration[axis] = filterBelow(
          this._acceleration[axis] / decelerationDamping,
          1e-2
        );
      }
    }
  }

  private _onUpdate(value: { deltaTime: number }): void {
    this._applyAcceleration(this._direction);

    // Update local translation based on acceleration
    this.translateX(this._acceleration.x * value.deltaTime);
    this.translateY(this._acceleration.y * value.deltaTime);
    this.translateZ(this._acceleration.z * value.deltaTime);
  }
}
