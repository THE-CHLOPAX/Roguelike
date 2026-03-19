// To be removed when no longer needed.

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { MODEL_MONK } from '../constants';

export type ModelTestState = {
  currentModelId: string | null;
  setCurrentModelId: (modelId: string | null) => void;
};

export const useModelTestStore = create<ModelTestState>()(
  subscribeWithSelector((set) => ({
    currentModelId: MODEL_MONK,
    setCurrentModelId: (modelId: string | null) => {
      set({ currentModelId: modelId });
    },
  }))
);
