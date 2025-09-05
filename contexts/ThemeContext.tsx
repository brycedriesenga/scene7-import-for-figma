import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        // Ask the main plugin code for the stored theme
        parent.postMessage({ pluginMessage: { type: 'GET_THEME' } }, '*');

        // Listen for messages from the main plugin code
        window.onmessage = (event) => {
            const msg = event.data.pluginMessage;
            if (msg && msg.type === 'THEME_IS') {
                if (msg.theme === 'light' || msg.theme === 'dark') {
                    setTheme(msg.theme);
                }
            }
        };
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        console.log(`Theme changed to: ${theme}. Applying class to HTML element.`);
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        console.log("HTML element classes:", root.className);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        // Tell the main plugin code to save the new theme
        parent.postMessage({ pluginMessage: { type: 'SET_THEME', theme: newTheme } }, '*');
    };
    
    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
