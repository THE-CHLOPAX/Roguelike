import { SceneConstructorOptions } from '@tgdf';

import { TestScene } from './TestScene';
import { Monk } from '../../3D/classes/gameObjects/players/Monk';

export class PathfindingTestScene extends TestScene {
  constructor(options: SceneConstructorOptions) {
    super(options);

    const monk = new Monk(this);

    this.add(monk);
  }
}
