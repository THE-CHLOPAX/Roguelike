import { Button } from '@radix-ui/themes';

type InternalButtonProps = {
  label: string;
  variant?: 'solid' | 'outline';
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export function InternalButton({
  label,
  onClick,
  variant = 'solid',
  disabled,
  style,
  className,
}: InternalButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={className}
    >
      {label}
    </Button>
  );
}
