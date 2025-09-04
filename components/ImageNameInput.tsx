import React from 'react';

interface ImageNameInputProps {
    value: string;
    onChange: (value: string) => void;
}

const ImageNameInput: React.FC<ImageNameInputProps> = ({ value, onChange }) => (
    <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Product Image URLs</label>
        <textarea
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md p-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono text-sm"
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., https://s7d4.scene7.com/is/image/WolverineWorldWide/MRLM-J038311-082624-F25-000"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Paste one or more URLs (or just SKUs), one per line.</p>
    </div>
);

export default ImageNameInput;