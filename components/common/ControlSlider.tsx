
import React from 'react';

interface ControlSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type="range"
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            {...props}
        />
    </div>
);

export default ControlSlider;
