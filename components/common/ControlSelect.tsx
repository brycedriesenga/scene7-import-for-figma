
import React from 'react';

interface ControlSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
}

const ControlSelect: React.FC<ControlSelectProps> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            {...props}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

export default ControlSelect;
