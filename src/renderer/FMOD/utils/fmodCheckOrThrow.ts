import { MESSAGES } from '../constants';
import { FMODObject } from '../fmodstudio';

export function fmodCheckOrThrow(fmod: FMODObject, result: number): void {
  if (result !== fmod.OK) {
    throw new Error(MESSAGES.API_ERROR(fmod.ErrorString(result)));
  }
}
