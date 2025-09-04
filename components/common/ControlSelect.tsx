import React from 'react';

interface ControlSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
}

const ControlSelect: React.FC<ControlSelectProps> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>
        <select
            className="w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md p-2 focus:ring-yellow-400 focus:border-yellow-400"
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