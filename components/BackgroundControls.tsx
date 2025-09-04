import React from 'react';

interface BackgroundControlsProps {
    selected: string;
    onChange: (value: string) => void;
}

const BG_OPTIONS = [
    { value: 'transparent', label: 'Grid' },
    { value: '#ffffff', label: 'White' },
    { value: '#808080', label: 'Grey' },
    { value: '#000000', label: 'Black' },
];

const BackgroundControls: React.FC<BackgroundControlsProps> = ({ selected, onChange }) => {
    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Preview Background</h3>
            <div className="flex items-center space-x-2">
                {BG_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            selected === opt.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
                <div className="relative">
                     <input
                        type="color"
                        value={typeof selected === 'string' && selected.startsWith('#') ? selected : '#808080'}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-8 h-8 p-0 border-none rounded-md cursor-pointer appearance-none bg-transparent"
                        style={{'--color': selected} as React.CSSProperties} // Workaround for some browsers not showing color
                    />
                </div>
            </div>
        </div>
    );
};

export default BackgroundControls;