import * as THREE from 'three';
import { KeyboardInput, MouseInput, Scene, compareFloats, filterBelow } from '@tgdf';

export type CameraDependencies = {
  options: {
    fov: number;
    aspect: number;
    near: number;
    far: number;
  };
  scene: Scene;
};

export class Camera extends THREE.PerspectiveCamera {
  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;

  private _isDragging: boolean = false;

  private _direction: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _maxAcceleration: THREE.Vector3 = new THREE.Vector3(10, 10, 10);
  private _accelerationDamping: number = 0.8;
  private _decelerationDamping: number = 0.03;

  constructor({ options, scene }: CameraDependencies) {
    super(options.fov, options.aspect, options.near, options.far);

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

  private _handleKeyboardInput(): void {
    this._keyboardInput.addKeyPressListener('w', () => {
      this._direction.z = -1;
    });
    this._keyboardInput.addKeyPressListener('a', () => {
      this._direction.x = -1;
    });
    this._keyboardInput.addKeyPressListener('s', () => {
      this._direction.z = 1;
    });
    this._keyboardInput.addKeyPressListener('d', () => {
      this._direction.x = 1;
    });
    this._keyboardInput.addKeyPressListener('Space', () => {
      this._direction.y = 1;
    });
    this._keyboardInput.addKeyPressListener('c', () => {
      this._direction.y = -1;
    });

    this._keyboardInput.addKeyUpListener('w', () => {
      this._direction.z = 0;
    });
    this._keyboardInput.addKeyUpListener('a', () => {
      this._direction.x = 0;
    });
    this._keyboardInput.addKeyUpListener('s', () => {
      this._direction.z = 0;
    });
    this._keyboardInput.addKeyUpListener('d', () => {
      this._direction.x = 0;
    });
    this._keyboardInput.addKeyUpListener('Space', () => {
      this._direction.y = 0;
    });
    this._keyboardInput.addKeyUpListener('c', () => {
      this._direction.y = 0;
    });
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
        direction[axis] === -1 &&
        compareFloats(this._acceleration[axis], 'greater-than', -this._maxAcceleration[axis])
      ) {
        const accelerationDamping = this._accelerationDamping <= 0 ? 1 : this._accelerationDamping;
        this._acceleration[axis] -= accelerationDamping;
      }
      if (
        direction[axis] === 1 &&
        compareFloats(this._acceleration[axis], 'less-than', this._maxAcceleration[axis])
      ) {
        const accelerationDamping = this._accelerationDamping <= 0 ? 1 : this._accelerationDamping;
        this._acceleration[axis] += accelerationDamping;
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
