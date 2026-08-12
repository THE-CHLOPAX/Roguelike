import { styled } from 'styled-components';

import { Text } from '../Text/Text';
import buttonActiveBg from '../../../assets/svg/button-active-bg.svg?url';
import buttonInactiveBg from '../../../assets/svg/button-inactive-bg.svg?url';

const SCALE = 3;

const NATIVE_WIDTH = 35;
const ACTIVE_HEIGHT = 20;
const INACTIVE_HEIGHT = 18;
const SPIKE_HEIGHT = ACTIVE_HEIGHT - INACTIVE_HEIGHT;

export type ButtonProps = {
  onClick?: () => void;
  label: string;
  disabled?: boolean;
};

export const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <Wrapper type="button" disabled={disabled} onClick={onClick}>
      <ButtonLabel size="md">{label}</ButtonLabel>
    </Wrapper>
  );
};

const Wrapper = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  padding-top: ${SPIKE_HEIGHT * SCALE}px;
  min-width: ${NATIVE_WIDTH * SCALE}px;
  height: ${ACTIVE_HEIGHT * SCALE}px;
  background-image: url(${buttonInactiveBg});
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: 100% auto;
  image-rendering: pixelated;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-image: url(${buttonActiveBg});
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
  }
`;

const ButtonLabel = styled(Text)`
  position: relative;
  top: 2px;
`;
