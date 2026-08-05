import { arraysShallowCompare } from '@tgdf';

import { SequenceInputType, SequenceSkill } from '3D/types';

export type InputSequenceItem = {
  input: SequenceInputType;
  timestamp: number;
};

export class InputSequenceTracker {
  private _inputBuffer: InputSequenceItem[] = [];

  constructor(private _timeOutMs: number) {}

  public push(
    input: SequenceInputType,
    now: number,
    skills: SequenceSkill[]
  ): SequenceSkill | null {
    const lastInput = this._inputBuffer[this._inputBuffer.length - 1];

    // Player hit the sequence key too late - reset buffer and return null.
    if (lastInput !== undefined && lastInput.timestamp + this._timeOutMs < now) {
      this.reset();
      return null;
    }

    this._inputBuffer.push({ input, timestamp: now });

    const currentSequence = this._inputBuffer.map((item) => item.input);
    const matchingSkill = skills.find((skill) =>
      arraysShallowCompare(currentSequence, skill.sequence)
    );

    if (matchingSkill) {
      this.reset();
      return matchingSkill;
    }

    return null;
  }

  public reset() {
    this._inputBuffer = [];
  }
}
