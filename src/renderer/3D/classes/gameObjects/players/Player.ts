import { Scene } from '@tgdf';

import { IdleState, State } from '../../states';
import { Entity, EntityOptions } from '../Entity';
import { PlayerActionType } from '../../../../../renderer/3D/types';

export type PlayerOptions = EntityOptions & {
  actions: {
    [key in PlayerActionType]?: (entity: Player) => State;
  };
  focusOptions?: FocusOptions;
};

export class Player extends Entity {
  public isPlayer = true;

  constructor(
    scene: Scene,
    public options: PlayerOptions
  ) {
    super(scene, options);

    this.stateController.currentState = new IdleState(this);
  }

  public onAction(actionType: PlayerActionType): State | null {
    return this.options.actions[actionType]?.(this) || null;
  }
}
