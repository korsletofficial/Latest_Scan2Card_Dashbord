import React, { useState, type KeyboardEvent } from 'react';

interface MultiInputProps {
    label: string;
    placeholder?: string;
    values: string[];
    onChange: (values: string[]) => void;
    type?: 'text' | 'email' | 'tel';
    validationFn?: (value: string) => boolean;
    errorMessage?: string;
}

const MultiInput: React.FC<MultiInputProps> = ({
    label,
    placeholder = 'Type and press Enter',
    values,
    onChange,
    type = 'text',
    validationFn,
    errorMessage = 'Invalid format',
}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Basic validation defaults if none provided
    const validate = (val: string) => {
        if (validationFn) return validationFn(val);
        if (type === 'email') {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        return true;
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addValue();
        } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
            removeValue(values.length - 1);
        }
    };

    const addValue = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        if (!validate(trimmed)) {
            setError(errorMessage);
            return;
        }

        if (values.includes(trimmed)) {
            setError('Value already exists');
            return;
        }

        onChange([...values, trimmed]);
        setInputValue('');
        setError(null);
    };

    const removeValue = (index: number) => {
        const newValues = values.filter((_, i) => i !== index);
        onChange(newValues);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#854AE6] focus-within:border-transparent bg-white min-h-[42px]">
                {values.map((value, index) => (
                    <div key={index} className="flex items-center gap-1 bg-[#F4ECFF] text-[#5E2AB2] text-sm px-2 py-1 rounded-md border border-[#E3D4FF]">
                        <span>{value}</span>
                        <button
                            type="button"
                            onClick={() => removeValue(index)}
                            className="hover:text-red-500 focus:outline-none"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
                <input
                    type={type}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (error) setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={addValue}
                    placeholder={values.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default MultiInput;
