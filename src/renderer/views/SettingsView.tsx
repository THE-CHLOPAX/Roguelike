import { useEffect, useMemo } from 'react';
import {
  useViewsStore,
  useSoundsStore,
  useGraphicsStore,
  MAIN_SOUND_CHANNEL,
  useKeyboard,
  AVAILABLE_RESOLUTIONS,
  InternalButton,
  InternalCheckbox,
  InternalFlex,
  InternalSelect,
  InternalSlider,
  InternalText,
} from '@tgdf';

export function SettingsView() {
  const { goBack } = useViewsStore();

  const { soundChannels, setChannelVolume } = useSoundsStore();

  const mainVolumeChannel = useMemo(() => soundChannels.get(MAIN_SOUND_CHANNEL), [soundChannels]);

  const { fullscreen, resolution, antialiasing, setResolution, setFullscreen, setAntialiasing } =
    useGraphicsStore();

  const { addKeyDownListener } = useKeyboard();

  useEffect(() => {
    addKeyDownListener('Escape', () => {
      goBack();
    });
  }, []);

  return (
    <InternalFlex
      direction="column"
      align="center"
      justify="center"
      style={{ gap: '20px', background: '#000', position: 'absolute', inset: 0 }}
    >
      <InternalText size="xl" weight="bold" color="white">
        Settings
      </InternalText>

      {/* Resolution Selector */}
      <InternalFlex direction="row" justify="between" gap={10} align="center">
        <InternalText size="lg" color="white">
          Resolution:
        </InternalText>
        <InternalSelect
          options={AVAILABLE_RESOLUTIONS.map((res) => ({
            value: res,
            label: `${res.width} x ${res.height}`,
          }))}
          value={resolution}
          onChange={(value) => {
            setResolution(value);
          }}
        />
      </InternalFlex>

      {/* Fullscreen Toggle */}
      <InternalFlex direction="row" justify="between" gap={10} align="center">
        <InternalText size="lg" color="white">
          Fullscreen:
        </InternalText>
        <InternalCheckbox checked={fullscreen} onChange={() => setFullscreen(!fullscreen)} />
      </InternalFlex>

      {/* Antialiasing Toggle */}
      <InternalFlex direction="row" justify="between" gap={10} align="center">
        <InternalText size="lg" color="white">
          Antialiasing:
        </InternalText>
        <InternalCheckbox checked={antialiasing} onChange={() => setAntialiasing(!antialiasing)} />
      </InternalFlex>

      {/* Main volume slider */}
      <InternalFlex direction="column" align="center" justify="center" style={{ width: '150px' }}>
        <InternalText size="lg" color="white">
          Main Volume: {mainVolumeChannel?.volume}
        </InternalText>
        <InternalSlider
          value={mainVolumeChannel?.volume}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => {
            setChannelVolume(MAIN_SOUND_CHANNEL, value);
          }}
        />
      </InternalFlex>

      <InternalButton label="Back" onClick={() => goBack()} />
    </InternalFlex>
  );
}
