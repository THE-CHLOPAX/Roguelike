import * as THREE from 'three';
import { create } from 'zustand';
import { traverseFind, logger } from '@tgdf';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export type AssetState = {
  textureCache: Map<string, THREE.Texture>;
  modelCacheJSON: Map<string, THREE.Object3D>;
  modelCacheGLTF: Map<string, THREE.Object3D>;
  modelCacheFBX: Map<string, THREE.Object3D>;
  loadTexture: (id: string, url: string, colorSpace?: THREE.ColorSpace) => Promise<THREE.Texture>;
  loadModelJSON: (id: string, url: string, nameExtractor?: string) => Promise<THREE.Object3D>;
  loadModelGLTF: (
    id: string,
    url: string,
    options?: LoadModelGLTFOptions
  ) => Promise<THREE.Object3D>;
  loadModelFBX: (id: string, url: string, options?: LoadModelFBXOptions) => Promise<THREE.Object3D>;
};

export type LoadModelGLTFOptions = {
  nameExtractor?: string;
  centerOrigin?: boolean; // Whether to reposition the model's origin to its geometric center (default: true)
};

export type LoadModelFBXOptions = {
  nameExtractor?: string;
  centerOrigin?: boolean; // Whether to reposition the model's origin to its geometric center (default: true)
  texturePaths?: Record<string, string>; // material name -> texture URL
};

export type ModelRecord = {
  type: 'model';
  id: string;
  path: string;
  nameExtractor?: string;
};

export type TextureRecord = {
  type: 'texture';
  id: string;
  path: string;
  colorSpace?: THREE.ColorSpace;
};

export type AssetRecord = ModelRecord | TextureRecord;

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
fbxLoader.setResourcePath('./assets/textures/');
const jsonLoader = new THREE.ObjectLoader();
const textureLoader = new THREE.TextureLoader();

const COPY_ASSETS_NOTE = '\n\n❗️ Make sure to copy new assets using npm run copy-assets.\n';

export const useAssetStore = create<AssetState>((set, get) => ({
  textureCache: new Map<string, THREE.Texture>(),
  modelCacheJSON: new Map<string, THREE.Object3D>(),
  modelCacheGLTF: new Map<string, THREE.Object3D>(),
  modelCacheFBX: new Map<string, THREE.Object3D>(),

  loadTexture: (id: string, url: string, colorSpace?: THREE.ColorSpace): Promise<THREE.Texture> => {
    // Check cache first
    const cached = get().textureCache.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
          if (colorSpace) {
            texture.colorSpace = colorSpace;
          }

          set((state) => ({
            textureCache: new Map(state.textureCache).set(id, texture),
          }));
          resolve(texture);
        },
        undefined,
        (error) => {
          reject(new Error(`Failed to load texture: ${url}, ${error}\n\n${COPY_ASSETS_NOTE}`));
        }
      );
    });
  },

  loadModelJSON: (id: string, url: string, nameExtractor?: string): Promise<THREE.Object3D> => {
    // Check cache first
    const cached = get().modelCacheJSON.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const scene = jsonLoader.parse(data.scene);
          let object: THREE.Object3D = scene;

          if (nameExtractor) {
            const foundObject = traverseFind(
              scene,
              (obj) => obj.name === nameExtractor && obj instanceof THREE.Object3D
            );
            if (!foundObject) {
              logger({
                message: `AssetStore: Object with name '${nameExtractor}' not found
                in model JSON: ${url}. Using entire scene as fallback.`,
                type: 'warn',
              });
            }
            object = foundObject || scene;
          }
          set((state) => ({
            modelCacheJSON: new Map(state.modelCacheJSON).set(id, object),
          }));
          resolve(object);
        })
        .catch((error) => {
          reject(new Error(`Failed to load model JSON: ${url}, ${error}.\n\n${COPY_ASSETS_NOTE}`));
        });
    });
  },

  loadModelGLTF: (
    id: string,
    url: string,
    options?: LoadModelGLTFOptions
  ): Promise<THREE.Object3D> => {
    // Check cache first
    const cached = get().modelCacheGLTF.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      gltfLoader.load(
        url,
        (gltf) => {
          let object: THREE.Object3D = gltf.scene;
          const nameExtractor = options?.nameExtractor;

          if (nameExtractor) {
            const foundObject = traverseFind(
              gltf.scene,
              (obj) => obj.name === nameExtractor && obj instanceof THREE.Object3D
            );
            if (!foundObject) {
              logger({
                message: `AssetStore: Object with name '${nameExtractor}' not found
                in GLTF model: ${url}. Using entire scene as fallback.`,
                type: 'warn',
              });
            }
            object = foundObject || gltf.scene;
          }

          // Reposition origin to geometric center by wrapping in a container
          const bbox = new THREE.Box3().setFromObject(object);
          const center = bbox.getCenter(new THREE.Vector3());

          // Create a container that will become the new "root" with centered origin
          const container = new THREE.Group();
          container.name = object.name + '_Container';

          if (options?.centerOrigin) {
            // Move the model so its geometric center is at the container's origin
            object.position.sub(center);
          }

          // Add model as child of container
          container.add(object);

          // Pass animations to the container (so they're accessible via the returned object)
          container.animations = gltf.animations;

          // Format animation names to lowercase for easier retrieval
          container.animations.forEach((clip) => {
            clip.name = clip.name.toLowerCase();
          });

          set((state) => ({
            modelCacheGLTF: new Map(state.modelCacheGLTF).set(id, container),
          }));
          resolve(container);
        },
        undefined,
        (error) => {
          reject(new Error(`Failed to load GLTF model: ${url}, ${error}.\n\n${COPY_ASSETS_NOTE}`));
        }
      );
    });
  },

  loadModelFBX: (
    id: string,
    url: string,
    options?: LoadModelFBXOptions
  ): Promise<THREE.Object3D> => {
    // Check cache first
    const cached = get().modelCacheFBX.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      fbxLoader.load(
        url,
        (fbx) => {
          let object: THREE.Object3D = fbx;
          const nameExtractor = options?.nameExtractor;

          if (nameExtractor) {
            const foundObject = traverseFind(
              fbx,
              (obj) => obj.name === nameExtractor && obj instanceof THREE.Object3D
            );
            if (!foundObject) {
              logger({
                message: `AssetStore: Object with name '${nameExtractor}' not found
                in FBX model: ${url}. Using entire scene as fallback.`,
                type: 'warn',
              });
            }
            object = foundObject || fbx;
          }

          // Reposition origin to geometric center by wrapping in a container
          const bbox = new THREE.Box3().setFromObject(object);
          const center = bbox.getCenter(new THREE.Vector3());

          // Create a container that will become the new "root" with centered origin
          const container = new THREE.Group();
          container.name = object.name + '_Container';

          if (options?.centerOrigin) {
            // Move the model so its geometric center is at the container's origin
            object.position.sub(center);
          }

          // Add model as child of container
          container.add(object);

          // Pass animations to the container (so they're accessible via the returned object)
          container.animations = fbx.animations;

          // Format animation names to lowercase for easier retrieval
          container.animations.forEach((clip) => {
            clip.name = clip.name.toLowerCase();
          });

          // Load and assign each named material's texture (FBX doesn't embed textures like
          // GLTF does, so they're fetched separately and matched onto materials by name).
          const texturePaths = options?.texturePaths;
          const textureAssignments: Promise<void>[] = [];

          if (texturePaths) {
            container.traverse((child) => {
              if (!(child instanceof THREE.Mesh)) return;

              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((material) => {
                const texturePath = texturePaths[material.name];
                if (!texturePath) return;

                textureAssignments.push(
                  get()
                    .loadTexture(texturePath, texturePath, THREE.SRGBColorSpace)
                    .then((texture) => {
                      (material as THREE.MeshStandardMaterial).map = texture;
                      material.needsUpdate = true;
                    })
                );
              });
            });
          }

          Promise.all(textureAssignments).then(() => {
            set((state) => ({
              modelCacheFBX: new Map(state.modelCacheFBX).set(id, container),
            }));
            resolve(container);
          });
        },
        undefined,
        (error) => {
          reject(new Error(`Failed to load FBX model: ${url}, ${error}.\n\n${COPY_ASSETS_NOTE}`));
        }
      );
    });
  },
}));

export const getModelFromStore = (id: string): THREE.Object3D | undefined => {
  const modelObject =
    useAssetStore.getState().modelCacheJSON.get(id) ||
    useAssetStore.getState().modelCacheGLTF.get(id) ||
    useAssetStore.getState().modelCacheFBX.get(id);
  // Model has to be copied using skeleton utils
  return modelObject ? clone(modelObject) : undefined;
};

const MODEL_CACHE_KEYS = ['modelCacheJSON', 'modelCacheGLTF', 'modelCacheFBX'] as const;

function disposeModel(model: THREE.Object3D): void {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.geometry.dispose();

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

function unloadTexture(id: string): void {
  const texture = useAssetStore.getState().textureCache.get(id);
  if (!texture) return;

  texture.dispose();

  useAssetStore.setState((state) => {
    const next = new Map(state.textureCache);
    next.delete(id);
    return { textureCache: next };
  });
}

function unloadModel(id: string): void {
  MODEL_CACHE_KEYS.forEach((cacheKey) => {
    const model = useAssetStore.getState()[cacheKey].get(id);
    if (!model) return;

    disposeModel(model);

    useAssetStore.setState((state) => {
      const next = new Map(state[cacheKey]);
      next.delete(id);
      return { [cacheKey]: next };
    });
  });
}

export const unloadAssets = (assets: AssetRecord[]): void => {
  assets.forEach((asset) => {
    if (asset.type === 'texture') {
      unloadTexture(asset.id);
    } else {
      unloadModel(asset.id);
    }
  });
};
