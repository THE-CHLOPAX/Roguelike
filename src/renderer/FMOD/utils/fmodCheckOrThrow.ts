import { FMODObject } from '../fmodstudio';

export function fmodCheckOrThrow(fmod: FMODObject, result: number): void {
  if (result !== fmod.OK) {
    throw new Error(`[FMOD] ${fmod.ErrorString(result)}`);
  }
}
