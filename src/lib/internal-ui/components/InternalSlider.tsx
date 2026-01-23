import { Slider } from '@radix-ui/themes';

type InternalSliderProps = {
    value?: number;
    onValueChange?: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    size?: '1' | '2' | '3';
};

export function InternalSlider({
    value = 0,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    size = '2'
}: InternalSliderProps) {
    return (
        <Slider
            value={[value]}
            onValueChange={(value) => {
                if (onValueChange) {
                    onValueChange(value[0]);
                }
            }}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            size={size}
        />
    );
}
