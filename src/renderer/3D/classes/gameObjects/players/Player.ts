import { Scene } from '@tgdf';

import { State } from '../../states';
import { Entity, EntityOptions } from '../Entity';
import { PlayerActionType } from '../../../../../renderer/3D/types';

export type PlayerOptions = EntityOptions & {
  actions: {
    [key in PlayerActionType]?: (entity: Player) => State;
  };
};
export class Player extends Entity {
  constructor(
    scene: Scene,
    public options: PlayerOptions
  ) {
    super(scene, options);
  }

  public onAction(actionType: PlayerActionType): State | null {
    return this.options.actions[actionType]?.(this) || null;
  }
}
