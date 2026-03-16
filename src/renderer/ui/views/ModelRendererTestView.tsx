import { useState } from 'react';
import styled from 'styled-components';
import { InternalButton, InternalLoader, useAssetStore, useGraphicsStore } from '@tgdf';

import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { useModelTestStore } from '../../store/useModelTestStore';
import { BackToViewLayout } from '../../layouts/BackToViewLayout';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';
import { CHECKERBOARD_TEXTURE, MODEL_KNIGHT, MODEL_MONK } from '../../constants';
import { ModelRendererTestScene } from '../../scenes/test/ModelRendererTestScene';

export function ModelRendererTestView() {
  const { loadTexture, loadModelGLTF } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: ModelRendererTestScene,
    assetsToLoad: [
      loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
      loadModelGLTF(MODEL_MONK, './assets/monk.glb', 'Monk'),
      loadModelGLTF(MODEL_KNIGHT, './assets/knight.glb', 'Knight'),
    ],
  });

  const { currentModelId, setCurrentModelId } = useModelTestStore();

  const [loadingFinished, setLoadingFinished] = useState(false);

  return (
    <BackToViewLayout backToView="menu">
      {!loadingFinished ? (
        <InternalLoader
          progress={loadingProgress * 100}
          onComplete={() => setLoadingFinished(true)}
        />
      ) : (
        <>
          <StyledInternalButton
            onClick={() =>
              setCurrentModelId(currentModelId === MODEL_MONK ? MODEL_KNIGHT : MODEL_MONK)
            }
            label="Toggle model"
          />
          <ThreeDViewerPixelated
            scene={scene!}
            resX={resolution.width}
            resY={resolution.height}
            debug
          />
        </>
      )}
    </BackToViewLayout>
  );
}

const StyledInternalButton = styled(InternalButton)`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
`;
