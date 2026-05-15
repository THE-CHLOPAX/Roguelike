import * as THREE from 'three';
import { GameObject, GameObjectComponent, Input, logger } from '@tgdf';

export class MouseInteractionObserver extends GameObjectComponent {
  private _raycaster: THREE.Raycaster;
  private _input = Input.getInstance();
  private _meshes: THREE.Mesh[] | null = null;

  private _leftClickCallback: ((intersections: THREE.Intersection[]) => void) | null = null;
  private _rightClickCallback: ((intersections: THREE.Intersection[]) => void) | null = null;
  private _middleClickCallback: ((intersections: THREE.Intersection[]) => void) | null = null;

  constructor(gameObject: GameObject, meshes?: THREE.Mesh[]) {
    super(gameObject);

    this._raycaster = new THREE.Raycaster();
    this._meshes = meshes || null;

    this._input.addMouseClickListener('left', this._onClickHandler);
    this._input.addMouseClickListener('right', this._onClickHandler);
    this._input.addMouseClickListener('middle', this._onClickHandler);
  }

  public onLeftClick(callback: (intersections: THREE.Intersection[]) => void): void {
    this._leftClickCallback = callback;
  }

  public onRightClick(callback: (intersections: THREE.Intersection[]) => void): void {
    this._rightClickCallback = callback;
  }

  public onMiddleClick(callback: (intersections: THREE.Intersection[]) => void): void {
    this._middleClickCallback = callback;
  }

  // Should we add onHover? Do we need this in the game?

  protected onDestroyed(): void {
    this._input.removeMouseClickListener('left', this._onClickHandler);
    this._input.removeMouseClickListener('right', this._onClickHandler);
    this._input.removeMouseClickListener('middle', this._onClickHandler);
  }

  private _onClickHandler = (e: MouseEvent) => {
    const intersections = this._castRay();
    switch (e.button) {
      case 0: // Left click
        if (this._leftClickCallback) this._leftClickCallback(intersections);
        break;
      case 1: // Middle click
        if (this._middleClickCallback) this._middleClickCallback(intersections);
        break;
      case 2: // Right click
        if (this._rightClickCallback) this._rightClickCallback(intersections);
        break;
    }
  };

  private _castRay(): THREE.Intersection[] {
    const camera = this.gameObject.scene?.camera;

    if (!camera) {
      logger({
        message: 'Camera not available in scene for MouseInteractionObserver',
        type: 'error',
      });
      return [];
    }

    const mousePos = new THREE.Vector2(this._input.mouseX, this._input.mouseY);
    const mousePosNormalized = new THREE.Vector2(
      (mousePos.x / window.innerWidth) * 2 - 1,
      -(mousePos.y / window.innerHeight) * 2 + 1
    );

    this._raycaster.setFromCamera(mousePosNormalized, camera);

    if (this._meshes) {
      return this._raycaster.intersectObjects(this._meshes, true);
    }

    return this._raycaster.intersectObject(this.gameObject, true);
  }
}
