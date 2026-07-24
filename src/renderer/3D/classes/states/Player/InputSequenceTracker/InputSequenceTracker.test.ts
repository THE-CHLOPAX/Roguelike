import type { State } from '3D/classes/states';

import { describe, it, expect, vi } from 'vitest';

import { PlayerActionType, SequenceInputType, SequenceSkill } from '3D/types';

import { InputSequenceTracker } from './InputSequenceTracker';

vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

const { ACTION_UP, ACTION_DOWN, ACTION_LEFT, ACTION_RIGHT } = PlayerActionType;

const TIMEOUT_MS = 500;

const createSkill = (sequence: SequenceInputType[]): SequenceSkill => ({
  sequence,
  getState: () => ({}) as State,
});

describe('InputSequenceTracker', () => {
  it('returns null while the sequence is incomplete', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN, ACTION_LEFT]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    expect(tracker.push(ACTION_UP, 0)).toBeNull();
    expect(tracker.push(ACTION_DOWN, 100)).toBeNull();
  });

  it('returns the skill once its full sequence is entered in order', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN, ACTION_LEFT]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    tracker.push(ACTION_UP, 0);
    tracker.push(ACTION_DOWN, 100);

    expect(tracker.push(ACTION_LEFT, 200)).toBe(skill);
  });

  it('returns null when the inputs do not match any skill sequence', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    expect(tracker.push(ACTION_DOWN, 0)).toBeNull();
    expect(tracker.push(ACTION_UP, 100)).toBeNull();
  });

  it('matches the skill corresponding to the entered sequence among multiple skills', () => {
    const kickSkill = createSkill([ACTION_UP, ACTION_UP]);
    const healSkill = createSkill([ACTION_DOWN, ACTION_RIGHT]);
    const tracker = new InputSequenceTracker([kickSkill, healSkill], TIMEOUT_MS);

    tracker.push(ACTION_DOWN, 0);

    expect(tracker.push(ACTION_RIGHT, 100)).toBe(healSkill);
  });

  it('matches when every input arrives within the timeout of the previous one', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN, ACTION_LEFT]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    tracker.push(ACTION_UP, 0);
    tracker.push(ACTION_DOWN, TIMEOUT_MS - 1);

    expect(tracker.push(ACTION_LEFT, (TIMEOUT_MS - 1) * 2)).toBe(skill);
  });

  it('accepts an input arriving exactly at the timeout boundary', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    tracker.push(ACTION_UP, 0);

    expect(tracker.push(ACTION_DOWN, TIMEOUT_MS)).toBe(skill);
  });

  it('resets progress and discards the input when it arrives after the timeout', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    tracker.push(ACTION_UP, 0);

    expect(tracker.push(ACTION_UP, TIMEOUT_MS + 1)).toBeNull();
    // The late input was discarded, so ACTION_DOWN alone must not complete the sequence.
    expect(tracker.push(ACTION_DOWN, TIMEOUT_MS + 2)).toBeNull();
  });

  it('matches a fresh sequence entered after a timeout reset', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    tracker.push(ACTION_UP, 0);
    tracker.push(ACTION_LEFT, TIMEOUT_MS + 100);

    tracker.push(ACTION_UP, TIMEOUT_MS + 200);

    expect(tracker.push(ACTION_DOWN, TIMEOUT_MS + 300)).toBe(skill);
  });

  it('discards progress when reset is called', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    tracker.push(ACTION_UP, 0);
    tracker.reset();

    expect(tracker.push(ACTION_DOWN, 100)).toBeNull();
  });

  it('resets after a match', () => {
    const skill = createSkill([ACTION_UP, ACTION_DOWN]);
    const tracker = new InputSequenceTracker([skill], TIMEOUT_MS);

    const resetSpy = vi.spyOn(tracker, 'reset');

    tracker.push(ACTION_UP, 0);
    expect(tracker.push(ACTION_DOWN, 100)).toBe(skill);
    expect(resetSpy).toHaveBeenCalledOnce();
  });
});
