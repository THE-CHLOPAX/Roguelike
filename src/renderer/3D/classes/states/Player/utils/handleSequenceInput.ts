import type { State } from '../..';
import type { Player } from '../../../gameObjects/players/Player';

import { InputState } from '@tgdf';

import { PlayerActionType, SequenceInputType } from '3D/types';
import { mapInputToControls } from '3D/utils/mapInputToControls';

/**
 * Feeds sequence inputs into the player's shared InputSequenceTracker,
 * matching only against the skills available in the given state. Returns
 * the state to transition into when a matched skill provides one, or null
 * when nothing matched (or the matched skill has no state transition).
 */
export function handleSequenceInput(
  state: State,
  entity: Player,
  inputState: InputState
): State | null {
  const controlsState = mapInputToControls(inputState);
  const lastInput = controlsState[0];

  if (!isSequenceInputType(lastInput.type)) return null;

  const eligibleSkills = entity.sequenceSkills.filter(
    (skill) =>
      skill.availableIn.some((stateConstructor) => state instanceof stateConstructor) &&
      !entity.isSkillOnCooldown(skill)
  );

  const matchedSkill = entity.sequenceTracker.push(
    lastInput.type,
    performance.now(),
    eligibleSkills
  );

  if (matchedSkill === null) return null;

  entity.startSkillCooldown(matchedSkill);
  matchedSkill.callback?.(entity);
  return matchedSkill.getState?.(entity, state) ?? null;
}

export function isSequenceInputType(type: string): type is SequenceInputType {
  return (
    type === PlayerActionType.ACTION_UP ||
    type === PlayerActionType.ACTION_DOWN ||
    type === PlayerActionType.ACTION_RIGHT ||
    type === PlayerActionType.ACTION_LEFT
  );
}
