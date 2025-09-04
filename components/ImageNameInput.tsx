import React from 'react';

interface ImageNameInputProps {
    value: string;
    onChange: (value: string) => void;
}

const ImageNameInput: React.FC<ImageNameInputProps> = ({ value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Product Image URLs</label>
        <textarea
            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 font-mono text-sm"
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., https://s7d4.scene7.com/is/image/WolverineWorldWide/MRLM-J038311-082624-F25-000"
        />
        <p className="text-xs text-gray-400 mt-1">Paste one or more URLs (or just SKUs), one per line.</p>
    </div>
);

export default ImageNameInput;