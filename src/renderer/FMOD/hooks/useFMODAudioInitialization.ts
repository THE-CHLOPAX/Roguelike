import { logger } from '@tgdf';
import { useState, useEffect } from 'react';

import { FMODAudio } from '../FMODAudio';

export type UseFMODAudioResult = {
  instance: FMODAudio | null;
  isReady: boolean;
  isLoading: boolean;
  isError: boolean;
};

export type UseFMODAudioProps = {
  bankUrls: string[];
};

export const useFMODAudioInitialization = ({ bankUrls }: UseFMODAudioProps): UseFMODAudioResult => {
  const [instance, setInstance] = useState<FMODAudio | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadBanks = async (audioInstance: FMODAudio) => {
    const loadPromises = bankUrls.map((bankUrl) => audioInstance.loadBank(bankUrl));
    await Promise.all(loadPromises);
  };

  const init = async (audioInstance: FMODAudio) => {
    const initialized = await audioInstance.init();

    // If properly initialized
    if (initialized) {
      await loadBanks(audioInstance);
      setIsReady(true);
      setIsLoading(false);

      audioInstance.logEventPaths();
    }
    // Failed to initialize
    else {
      setIsReady(false);
      setIsLoading(false);
      setIsError(true);
      logger({ message: 'Failed to initialize FMOD Audio', type: 'error' });
    }
  };

  useEffect(() => {
    const audioInstance = FMODAudio.getInstance();
    setInstance(audioInstance);

    init(audioInstance);
  }, []);

  return {
    instance,
    isReady,
    isLoading,
    isError,
  };
};
