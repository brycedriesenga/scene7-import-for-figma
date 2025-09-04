import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <span role="img" aria-label="Moon" className="text-xl">
                    🌝
                </span>
            ) : (
                <span role="img" aria-label="Sun" className="text-xl">
                    🌞
                </span>
            )}
        </button>
    );
};

export default ThemeToggle;