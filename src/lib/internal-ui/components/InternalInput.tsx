import * as React from 'react';
import { TextField } from '@radix-ui/themes';

type InternalInputProps = {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel';
    disabled?: boolean;
    size?: '1' | '2' | '3';
};

export function InternalInput({ 
    value, 
    onChange, 
    placeholder, 
    type = 'text',
    disabled,
    size = '2'
}: InternalInputProps) {
    return (
        <TextField.Root
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            disabled={disabled}
            size={size}
        />
    );
}
