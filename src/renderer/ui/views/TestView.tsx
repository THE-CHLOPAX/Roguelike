import { useState, useEffect } from 'react';
import { InternalLoader, MAIN_SOUND_CHANNEL, useAssetStore, useGraphicsStore } from '@tgdf';

import { MODELS } from '../../3D/constants';
import { CHECKERBOARD_TEXTURE } from '../../3D/constants';
import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { TestScene } from '../../3D/classes/scenes/TestScene';
import { BackToViewLayout } from '../../layouts/BackToViewLayout';
import { FMODAudio, FMODEventInstance, FMOD_EVENTS } from '../../FMOD';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';

export function TestView() {
  const { loadTexture, loadModelGLTF } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: TestScene,
    asyncPreloadOperations: [
      loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
      loadModelGLTF(MODELS.MONK.id, MODELS.MONK.path, {
        nameExtractor: MODELS.MONK.nameExtractor,
        centerOrigin: true,
      }),
      loadModelGLTF(MODELS.SKELETON.id, MODELS.SKELETON.path, {
        nameExtractor: MODELS.SKELETON.nameExtractor,
        centerOrigin: true,
      }),
    ],
  });

  const [loadingFinished, setLoadingFinished] = useState(false);

  useEffect(() => {
    let eventInstance: FMODEventInstance;
    if (loadingFinished) {
      eventInstance = FMODAudio.playEventInSoundChannel({
        eventPath: FMOD_EVENTS.MUSIC_SYSTEM,
        channelId: MAIN_SOUND_CHANNEL,
      });
    }
    return () => {
      if (eventInstance) {
        FMODAudio.stopEvent(eventInstance);
      }
    };
  }, [loadingFinished]);

  return (
    <BackToViewLayout backToView="MenuView">
      {!loadingFinished ? (
        <InternalLoader
          progress={loadingProgress * 100}
          onComplete={() => setLoadingFinished(true)}
        />
      ) : (
        <ThreeDViewerPixelated
          scene={scene!}
          resX={resolution.width}
          resY={resolution.height}
          debug
        />
      )}
    </BackToViewLayout>
  );
}
