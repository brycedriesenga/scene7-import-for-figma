
import React from 'react';

interface ControlInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const ControlInput: React.FC<ControlInputProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
            {...props}
        />
    </div>
);

export default ControlInput;
