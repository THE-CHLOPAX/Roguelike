import * as THREE from 'three';
import { logger } from '@tgdf/internal-ui/utils/logger';

export type ResourceType =
  | THREE.Object3D
  | THREE.BufferGeometry
  | THREE.Material
  | THREE.Texture
  | (THREE.Object3D | THREE.Material | THREE.Texture)[]
  | null
  | undefined;

/**
 * Utility class to track and dispose of THREE.js resources like geometries, materials, and textures.
 * This helps prevent memory leaks by ensuring that all resources are properly disposed of when no longer needed.
 */
export class ResourceTracker {
  public resources: Set<ResourceType>;

  constructor() {
    this.resources = new Set();
  }

  public track(resource: ResourceType): ResourceType {
    if (!resource) {
      return resource;
    }

    // Handle children and when material is an array of materials or
    // uniform is array of textures
    if (Array.isArray(resource)) {
      resource.forEach((resource) => this.track(resource));
      return resource;
    }

    // Check for dispose method (Materials and Textures have it, Object3D doesn't)
    if ('dispose' in resource && typeof resource.dispose === 'function') {
      this.resources.add(resource);
    }

    if (resource instanceof THREE.Object3D) {
      // If it's a Mesh, we also want to track its geometry and material
      if (resource instanceof THREE.Mesh) {
        this.track(resource.geometry);
        this.track(resource.material);
      }

      this.track(resource.children);
    } else if (resource instanceof THREE.Material) {
      // We have to check if there are any textures on the material
      for (const value of Object.values(resource)) {
        if (value instanceof THREE.Texture) {
          this.track(value);
        }
      }

      // We also have to check if any uniforms reference textures or arrays of textures
      if (
        (resource instanceof THREE.ShaderMaterial || resource instanceof THREE.RawShaderMaterial) &&
        resource.uniforms
      ) {
        for (const value of Object.values(resource.uniforms)) {
          if (value) {
            const uniformValue = value.value;
            if (uniformValue instanceof THREE.Texture || Array.isArray(uniformValue)) {
              this.track(uniformValue);
            }
          }
        }
      }
    }

    return resource;
  }

  public untrack(resource: ResourceType) {
    this.resources.delete(resource);
  }

  public dispose() {
    console.groupCollapsed(`ResourceTracker: Disposing of ${this.resources.size} resources`);

    for (const resource of this.resources) {
      if (resource && 'dispose' in resource && typeof resource.dispose === 'function') {
        logger({
          type: 'info',
          message: `ResourceTracker: Disposing of ${resource.constructor.name}.`,
        });
        resource.dispose();
      } else {
        logger({
          type: 'warn',
          message: `ResourceTracker: Resource of type ${resource?.constructor.name}
          does not have a dispose method.`,
        });
      }
    }

    console.groupEnd();

    this.resources.clear();
  }
}
