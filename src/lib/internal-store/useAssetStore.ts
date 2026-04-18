import * as THREE from 'three';
import { create } from 'zustand';
import { traverseFind, logger } from '@tgdf';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export type AssetState = {
  imageCache: Map<string, HTMLImageElement>;
  textureCache: Map<string, THREE.Texture>;
  audioCache: Map<string, HTMLAudioElement>;
  fontCache: Map<string, FontFace>;
  modelCacheJSON: Map<string, THREE.Object3D>;
  modelCacheGLTF: Map<string, THREE.Object3D>;
  loadImage: (id: string, url: string) => Promise<HTMLImageElement>;
  loadTexture: (id: string, url: string) => Promise<THREE.Texture>;
  loadAudio: (id: string, url: string, volume?: number) => Promise<HTMLAudioElement>;
  loadFont: (id: string, url: string) => Promise<FontFace>;
  loadModelJSON: (id: string, url: string, nameExtractor?: string) => Promise<THREE.Object3D>;
  loadModelGLTF: (
    id: string,
    url: string,
    options?: LoadModelGLTFOptions
  ) => Promise<THREE.Object3D>;
};

export type LoadModelGLTFOptions = {
  nameExtractor?: string;
  centerOrigin?: boolean; // Whether to reposition the model's origin to its geometric center (default: true)
};

const gltfLoader = new GLTFLoader();
const jsonLoader = new THREE.ObjectLoader();
const textureLoader = new THREE.TextureLoader();

const COPY_ASSETS_NOTE = '\n\n❗️ Make sure to copy new assets using npm run copy-assets.\n';

export const useAssetStore = create<AssetState>((set, get) => ({
  imageCache: new Map<string, HTMLImageElement>(),
  textureCache: new Map<string, THREE.Texture>(),
  audioCache: new Map<string, HTMLAudioElement>(),
  fontCache: new Map<string, FontFace>(),
  modelCacheJSON: new Map<string, THREE.Object3D>(),
  modelCacheGLTF: new Map<string, THREE.Object3D>(),

  loadImage: (id: string, url: string): Promise<HTMLImageElement> => {
    // Check cache first
    const cached = get().imageCache.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        set((state) => ({
          imageCache: new Map(state.imageCache).set(id, img),
        }));
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}\n\n${COPY_ASSETS_NOTE}`));
      };
    });
  },

  loadTexture: (id: string, url: string): Promise<THREE.Texture> => {
    // Check cache first
    const cached = get().textureCache.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
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

  loadAudio: (id: string, url: string, volume?: number): Promise<HTMLAudioElement> => {
    // Check cache first
    const cached = get().audioCache.get(id);
    if (cached) {
      // Clone the audio element if volume is different
      if (volume !== undefined && cached.volume !== volume) {
        const clonedAudio = cached.cloneNode() as HTMLAudioElement;
        clonedAudio.volume = volume;
        return Promise.resolve(clonedAudio);
      }
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = url;
      audio.volume = volume ?? 1;
      audio.oncanplaythrough = () => {
        useAssetStore.setState((state) => ({
          audioCache: new Map(state.audioCache).set(id, audio),
        }));
        resolve(audio);
      };
      audio.onerror = () => {
        reject(new Error(`Failed to load audio: ${url}\n\n${COPY_ASSETS_NOTE}`));
      };
    });
  },

  loadFont: (id: string, url: string): Promise<FontFace> => {
    // Check cache first
    const cached = get().fontCache.get(id);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      const font = new FontFace(id, `url(${url})`);
      font
        .load()
        .then((loadedFont) => {
          document.fonts.add(loadedFont);
          set((state) => ({
            fontCache: new Map(state.fontCache).set(id, loadedFont),
          }));
          resolve(loadedFont);
        })
        .catch(() => {
          reject(new Error(`Failed to load font: ${url}\n\n${COPY_ASSETS_NOTE}`));
        });
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
}));

// TODO: is this being used?
export const loadModelJSON = useAssetStore.getState().loadModelJSON;

export const getModelFromStore = (id: string): THREE.Object3D | undefined => {
  const modelObject =
    useAssetStore.getState().modelCacheJSON.get(id) ||
    useAssetStore.getState().modelCacheGLTF.get(id);
  // Model has to be copied using skeleton utils
  return modelObject ? clone(modelObject) : undefined;
};
