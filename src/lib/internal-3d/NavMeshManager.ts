import * as THREE from 'three';
import { Scene, logger } from '@tgdf';
import { BoxObstacle, Crowd, NavMesh, TileCache } from '@recast-navigation/core';
import { CrowdHelper, DebugDrawer, TileCacheHelper } from '@recast-navigation/three';

import { generateTileCacheFromThreeDObject } from './utils/generateTileCacheFromThreeDObject';

export type NavMeshManagerOptions = {
  cellSize?: number;
  cellHeight?: number;
  agentRadius?: number;
  agentHeight?: number;
};

type ObstacleUserData = {
  obstacle: BoxObstacle;
};

const DEFAULT_CELL_SIZE = 0.2; // Smaller = more precision
const DEFAULT_CELL_HEIGHT = 0.2;
const DEFAULT_AGENT_RADIUS = 0.6;
const DEFAULT_AGENT_HEIGHT = 2.0;

export class NavMeshManager {
  private _scene: Scene;

  private _crowdMap: Map<string, Crowd> = new Map();
  private _crowdHelperMap: Map<string, CrowdHelper> = new Map();

  private _obstacleMap: Map<string, THREE.Object3D> = new Map(); // Map of obstacle IDs to their references in the TileCache

  private _tileCache: TileCache | null = null;
  private _navMesh: NavMesh | null = null;
  private _debugNavMesh: DebugDrawer | null = null;
  private _debugTileCache: TileCacheHelper | null = null;

  private _options: Required<NavMeshManagerOptions>;

  constructor(scene: Scene, floorObject: THREE.Object3D, options?: NavMeshManagerOptions) {
    this._scene = scene;
    this._options = {
      cellSize: options?.cellSize || DEFAULT_CELL_SIZE,
      cellHeight: options?.cellHeight || DEFAULT_CELL_HEIGHT,
      agentRadius: options?.agentRadius || DEFAULT_AGENT_RADIUS,
      agentHeight: options?.agentHeight || DEFAULT_AGENT_HEIGHT,
    };

    this._generateTileCacheFromObject(floorObject);
  }

  public update(deltaTime: number): void {
    this._crowdMap.forEach((crowd) => {
      crowd.update(deltaTime);
    });

    if (this._tileCache && this._navMesh) {
      this._tileCache.update(this._navMesh);
    }
  }

  public addBoxObstacle(id: string, object: THREE.Object3D): void {
    if (!this._tileCache) {
      logger({
        message: 'Cannot add obstacle: TileCache is not initialized.',
        type: 'error',
      });
      return;
    }

    const meshBounds = new THREE.Box3().setFromObject(object);
    const obstacleSize = meshBounds.getSize(new THREE.Vector3()).multiplyScalar(0.5);

    // Add agent radius as padding to ensure agents can't squeeze through gaps
    const paddedSize = new THREE.Vector3(
      obstacleSize.x + this._options.agentRadius,
      obstacleSize.y,
      obstacleSize.z + this._options.agentRadius
    );

    const addObstacleResult = this._tileCache.addBoxObstacle(
      object.position,
      paddedSize,
      object.rotation.y
    );

    const obstacle = addObstacleResult?.obstacle;

    if (obstacle !== undefined) {
      if (this._obstacleMap.get(id)) {
        logger({
          message: `Obstacle with id ${id} already exists. It will be replaced.`,
          type: 'warn',
        });
        this.removeBoxObstacle(id);
      }

      object.userData.obstacle = obstacle; // Store reference to obstacle for later removal
      this._obstacleMap.set(id, object);
      this._scene.add(object);
    } else {
      logger({
        message: `Failed to add obstacle with id ${id} to TileCache.`,
        type: 'error',
      });
    }
  }

  public removeBoxObstacle(id: string): void {
    if (!this._tileCache) {
      logger({
        message: 'Cannot remove obstacle: TileCache is not initialized.',
        type: 'error',
      });
      return;
    }

    const obstacleObject = this._obstacleMap.get(id);
    const obstacleBox = (obstacleObject?.userData as ObstacleUserData)?.obstacle;

    if (obstacleObject !== undefined) {
      if (obstacleBox !== undefined) {
        this._tileCache.removeObstacle(obstacleBox);
      } else {
        logger({
          message: `Obstacle object for id ${id} does not have a reference to its BoxObstacle.`,
          type: 'error',
        });
      }

      this._scene.remove(obstacleObject);
      this._obstacleMap.delete(id);
    } else {
      logger({
        message: `Failed to remove obstacle with id ${id}: No such obstacle exists.`,
        type: 'error',
      });
    }
  }

  public addCrowd(
    id: string,
    options: { maxAgents: number; maxAgentRadius: number }
  ): Crowd | null {
    if (!this._navMesh) {
      logger({
        message: 'Cannot create Crowd: NavMesh is not generated.',
        type: 'error',
      });
      return null;
    }

    const crowd = new Crowd(this._navMesh, {
      maxAgents: options.maxAgents,
      maxAgentRadius: options.maxAgentRadius,
    });

    this._crowdMap.set(id, crowd);

    return crowd;
  }

  public toggleTileCacheDebug(show: boolean): void {
    if (!this._tileCache) {
      logger({
        message: 'TileCache is not available for debugging.',
        type: 'error',
      });
      return;
    }

    if (show) {
      this._debugTileCache = new TileCacheHelper(this._tileCache);
      this._scene.add(this._debugTileCache);
    } else {
      if (this._debugTileCache) {
        this._scene.remove(this._debugTileCache);
        this._debugTileCache = null;
      } else {
        logger({
          message: 'TileCache debug helper is not currently active.',
          type: 'error',
        });
      }
    }
  }

  public toggleCrowdDebug(crowdId: string, show: boolean): void {
    const crowd = this._crowdMap.get(crowdId);
    if (!crowd) {
      logger({
        message: `Cannot toggle debug for Crowd: Crowd with id ${crowdId} does not exist.`,
        type: 'error',
      });
      return;
    }

    if (show) {
      if (this._crowdHelperMap.get(crowdId)) {
        logger({
          message: `Debug helper for Crowd with id ${crowdId} already exists.`,
          type: 'warn',
        });
        return;
      }

      const crowdHelper = new CrowdHelper(crowd);
      this._crowdHelperMap.set(crowdId, crowdHelper);
      this._scene.add(crowdHelper);
    } else {
      const crowdHelper = this._crowdHelperMap.get(crowdId);

      if (!crowdHelper) {
        logger({
          message: `Cannot hide debug for Crowd:
          Debug helper for Crowd with id ${crowdId} does not exist.`,
          type: 'error',
        });
        return;
      }
      this._scene.remove(crowdHelper);
      this._crowdHelperMap.delete(crowdId);
    }
  }

  public getCrowd(id: string): Crowd | null {
    return this._crowdMap.get(id) ?? null;
  }

  public removeCrowd(id: string): void {
    this.toggleCrowdDebug(id, false);
    this._crowdMap.delete(id);
  }

  public toggleDebugNavMesh(show: boolean): void {
    if (!this._debugNavMesh) {
      logger({
        message: 'Debug NavMesh is not available.',
        type: 'error',
      });
      return;
    }

    if (show) {
      this._scene.add(this._debugNavMesh);
    } else {
      this._scene.remove(this._debugNavMesh);
    }
  }

  private _generateTileCacheFromObject(object: THREE.Object3D): void {
    const { navMesh, tileCache, debugNavMesh } = generateTileCacheFromThreeDObject(object, {
      cs: this._options.cellSize,
      ch: this._options.cellHeight,
      // Erode NavMesh by agent radius - this prevents tight gaps
      walkableRadius: Math.ceil(this._options.agentRadius / this._options.cellSize),
      walkableHeight: Math.ceil(this._options.agentHeight / this._options.cellHeight),
    });

    this._navMesh = navMesh;
    this._tileCache = tileCache;
    this._debugNavMesh = debugNavMesh;

    if (debugNavMesh) {
      debugNavMesh.drawNavMesh(navMesh);
    }
  }
}
