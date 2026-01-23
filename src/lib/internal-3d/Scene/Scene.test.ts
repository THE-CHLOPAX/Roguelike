import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';

import { Scene } from './Scene';
import { GameObject } from '../GameObject';

// Create a concrete implementation of the abstract Scene class for testing
class TestScene extends Scene {
    public camera: THREE.Camera;

    constructor(options = {}) {
        super(options);
        this.camera = new THREE.PerspectiveCamera();
    }
}

describe('Scene base class', () => {
    let testScene: TestScene;

    beforeEach(() => {
        testScene = new TestScene();
    });

    it('should convert objects with gameObjectComponents userData to GameObject instances', async () => {
        // Construct absolute path to the test GLTF file
        const testGltfPath = path.resolve(__dirname, './test-scene.json');

        // Read and parse the GLTF file
        const sceneData = JSON.parse(fs.readFileSync(testGltfPath, 'utf-8'));

        // Parse the GLTF data
        const scene = await new Promise<THREE.Object3D>((resolve) => {
            const loader = new THREE.ObjectLoader();
            loader.parse(sceneData.scene, (loadedScene) => {
                resolve(loadedScene);
            });
        });

        // Add GLTF children to test scene
        testScene.addAndConvertChildrenRecursive(scene.children);

        // Verify that a GameObjects ware properly created:

        // Non-game object lights
        const directionalLight = testScene.children.find(child => child.name === 'DirectionalLight');
        expect(directionalLight).toBeDefined();
        expect(directionalLight).not.toBeInstanceOf(GameObject);
        expect(directionalLight).toBeInstanceOf(THREE.DirectionalLight);

        // Check if there are no ambient lights - they are not supported while importing
        const ambientLight = testScene.children.find(child => child instanceof THREE.AmbientLight);
        expect(ambientLight).not.toBeDefined();

        // Sphere game object with non-game object camera child
        const sphereChild = testScene.children.find(child => child.name === 'Sphere');
        expect(sphereChild).toBeDefined();
        expect(sphereChild).toBeInstanceOf(GameObject);

        expect(sphereChild!.children.length).toBe(2);

        const sphereChildCamera = sphereChild!.children.find(child => child.name === 'PerspectiveCamera');
        expect(sphereChildCamera).toBeDefined();
        expect(sphereChildCamera).not.toBeInstanceOf(GameObject);
        expect(sphereChildCamera).toBeInstanceOf(THREE.PerspectiveCamera);

        // Non-game object plane
        const planeChild = testScene.children.find(child => child.name === 'Plane');
        expect(planeChild).toBeDefined();
        expect(planeChild).not.toBeInstanceOf(GameObject);

        // Non-game object lights
        const directionalLightChild = testScene.children.find(child => child.name === 'DirectionalLight');
        expect(directionalLightChild).toBeDefined();
        expect(directionalLightChild).not.toBeInstanceOf(GameObject);

        // Non-game object torus with both game object and non-game object children
        const torusChild = testScene.children.find(child => child.name === 'Torus');
        expect(torusChild).toBeDefined();
        expect(torusChild).not.toBeInstanceOf(GameObject);
        expect(torusChild).toBeInstanceOf(THREE.Mesh);

        const torusChildGameObject = torusChild!.children.find(child => child.name === 'TorusGameObjectChild');
        expect(torusChildGameObject).toBeDefined();
        expect(torusChildGameObject).toBeInstanceOf(GameObject);

        const torusChildRegular = torusChild!.children.find(child => child.name === 'TorusRegularChild');
        expect(torusChildRegular).toBeDefined();
        expect(torusChildRegular).toBeInstanceOf(THREE.Mesh);

        // Torus regular child with a game object child
        const torusGrandGameObject = torusChildRegular!.children.find(child => child.name === 'TorusRegularChildGameObjectChild');
        expect(torusGrandGameObject).toBeDefined();
        expect(torusGrandGameObject).toBeInstanceOf(GameObject);
    });
});