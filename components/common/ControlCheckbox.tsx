import React from 'react';

interface ControlCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

const ControlCheckbox: React.FC<ControlCheckboxProps> = ({ label, description, ...props }) => (
    <label className="flex items-start space-x-3 cursor-pointer">
        <div className="flex items-center h-5">
            <input
                type="checkbox"
                className="h-4 w-4 text-yellow-400 bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 rounded focus:ring-yellow-500"
                {...props}
            />
        </div>
        <div className="text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
            {description && <p className="text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
    </label>
);

export default ControlCheckbox;