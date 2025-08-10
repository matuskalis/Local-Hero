'use client';

import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: string[];
  error?: string;
  className?: string;
}

export default function FormInput({
  label,
  name,
  type,
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  placeholder,
  options = [],
  error,
  className = ''
}: FormInputProps) {
  const inputId = `input-${name}`;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={inputId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value === 'Don\'t have' ? -1 : e.target.value)}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${error ? 'border-red-500' : ''}`}
            required={required}
          >
            {options.map((option) => (
              <option key={option} value={option === 'Don\'t have' ? -1 : option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={inputId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 ${error ? 'border-red-500' : ''}`}
            rows={4}
            required={required}
          />
        );

      default:
        return (
          <input
            id={inputId}
            type={type}
            value={value || ''}
            onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${error ? 'border-red-500' : ''}`}
            required={required}
          />
        );
    }
  };

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
} 