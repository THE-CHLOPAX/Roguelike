import { create } from 'zustand';

export type ModelTestState = {
  currentModelId: string | null;
  setCurrentModelId: (modelId: string | null) => void;
};

export const useModelTestStore = create<ModelTestState>(() => ({
  currentModelId: null,
  setCurrentModelId: (modelId: string | null) => {
    useModelTestStore.setState({ currentModelId: modelId });
  },
}));
