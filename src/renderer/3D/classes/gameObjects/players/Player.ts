import { Scene } from '@tgdf';

import { IdleState, State } from '../../states';
import { Entity, EntityOptions } from '../Entity';
import { PlayerActionType, SequenceSkill } from '../../../../../renderer/3D/types';
import { InputSequenceTracker } from '../../states/Player/InputSequenceTracker/InputSequenceTracker';

const DEFAULT_SEQUENCE_TIMEOUT_MS = 500;

export type PlayerOptions = EntityOptions & {
  actions: {
    [key in PlayerActionType]?: (entity: Player) => State;
  };
  sequenceSkills?: SequenceSkill[];
  sequenceTimeoutMs?: number;
};

export class Player extends Entity {
  public isPlayer = true;
  public readonly sequenceSkills: SequenceSkill[];
  public readonly sequenceTracker: InputSequenceTracker;

  constructor(
    scene: Scene,
    public options: PlayerOptions
  ) {
    super(scene, options);

    this.sequenceSkills = options.sequenceSkills ?? [];
    this.sequenceTracker = new InputSequenceTracker(
      options.sequenceTimeoutMs ?? DEFAULT_SEQUENCE_TIMEOUT_MS
    );

    this.stateController.currentState = new IdleState(this);
  }

  public onAction(actionType: PlayerActionType): State | null {
    return this.options.actions[actionType]?.(this) || null;
  }
}
