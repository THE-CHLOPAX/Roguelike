import { FMODAudio } from './FMODAudio';

export type {
  FMODBank,
  FMODCoreSystem,
  FMODEventDescription,
  FMODEventInstance,
  FMODObject,
  FMODOutVal,
  FMODStudioSystem,
} from './fmodstudio';

const fmodAudio = FMODAudio.getInstance();

export { fmodAudio as FMODAudio };
export { FMOD_EVENTS } from './constants';

export { useFMODAudioInitialization } from './hooks/useFMODAudioInitialization';
