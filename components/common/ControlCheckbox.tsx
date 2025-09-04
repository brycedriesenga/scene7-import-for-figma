
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
                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                {...props}
            />
        </div>
        <div className="text-sm">
            <span className="font-medium text-gray-300">{label}</span>
            {description && <p className="text-gray-400">{description}</p>}
        </div>
    </label>
);

export default ControlCheckbox;
