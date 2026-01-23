import { Select } from '@radix-ui/themes';

type InternalSelectProps<T = string> = {
    value?: T;
    onChange?: (value: T) => void;
    options: Array<{ value: T; label: string }>;
    placeholder?: string;
    disabled?: boolean;
    size?: '1' | '2' | '3';
};

export function InternalSelect<T = string>({ 
    value, 
    onChange, 
    options, 
    placeholder = 'Select option',
    disabled,
    size = '2',
}: InternalSelectProps<T>) {
    // Convert value to string key for Radix UI
    const selectedIndex = value !== undefined 
        ? options.findIndex(opt => JSON.stringify(opt.value) === JSON.stringify(value))
        : -1;
    
    // Only set selectedKey if we found a match (index >= 0)
    const selectedKey = selectedIndex >= 0 ? selectedIndex.toString() : undefined;

    const handleChange = (key: string) => {
        const option = options[parseInt(key)];
        if (option && onChange) {
            onChange(option.value);
        }
    };

    return (
        <Select.Root value={selectedKey} onValueChange={handleChange} disabled={disabled} size={size}>
            <Select.Trigger placeholder={placeholder} />
            <Select.Content>
                {options.map((option, index) => (
                    <Select.Item key={index} value={index.toString()}>
                        {option.label}
                    </Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    );
}
