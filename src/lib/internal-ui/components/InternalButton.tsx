import { Button } from '@radix-ui/themes';

type InternalButtonProps = {
  label: string;
  variant?: 'solid' | 'outline';
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export function InternalButton({
  label,
  onClick,
  variant = 'solid',
  disabled,
  style,
}: InternalButtonProps) {
  return (
    <Button variant={variant} onClick={onClick} disabled={disabled} style={style}>
      {label}
    </Button>
  );
}
