import { Checkbox } from '@radix-ui/themes';

type InternalCheckboxProps = {
    label?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: '1' | '2' | '3';
};

export function InternalCheckbox({ 
    label, 
    checked, 
    onChange, 
    disabled,
    size = '2'
}: InternalCheckboxProps) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <Checkbox 
                size={size}
                checked={checked} 
                onCheckedChange={onChange} 
                disabled={disabled}
            />
            {label && <span>{label}</span>}
        </label>
    );
}
