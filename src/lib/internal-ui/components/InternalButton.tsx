import { Button } from '@radix-ui/themes';

type InternalButtonProps = {
    label: string;
    variant?: 'solid' | 'outline';
    onClick: () => void;
    disabled?: boolean;
};

export function InternalButton({ label, onClick, variant = 'solid', disabled }: InternalButtonProps) {
    return (
        <Button variant={variant} onClick={onClick} disabled={disabled}>
            {label}
        </Button>
    );
}