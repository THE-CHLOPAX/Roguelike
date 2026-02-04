import * as THREE from 'three';

export function isPerspectiveOrOrtographicCamera(
  camera: THREE.Camera
): camera is THREE.PerspectiveCamera | THREE.OrthographicCamera {
  return camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera;
}
