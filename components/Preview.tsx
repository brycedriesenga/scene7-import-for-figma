import React, { useState, useEffect, useMemo, useRef } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

const PreviewItem: React.FC<{ url: string; shadowUrl?: string; background: string; }> = ({ url, shadowUrl, background }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        // Reset state whenever the URL changes
        setIsLoading(true);
        setError(null);

        const imageElement = imgRef.current;
        if (!imageElement) return;
        
        const handleLoad = () => {
            setIsLoading(false);
            setError(null);
        };
        
        const handleError = () => {
            setIsLoading(false);
            setError('Load failed');
        };

        // If the image is already loaded (e.g., from cache), handle it immediately
        if (imageElement.complete && imageElement.naturalHeight > 0) {
            handleLoad();
            return;
        }

        imageElement.addEventListener('load', handleLoad);
        imageElement.addEventListener('error', handleError);

        // Cleanup listeners
        return () => {
            imageElement.removeEventListener('load', handleLoad);
            imageElement.removeEventListener('error', handleError);
        };
    }, [url]);


    const backgroundStyle = useMemo((): React.CSSProperties => {
        if (background === 'transparent') {
            const isDark = theme === 'dark';
            const gridColor = isDark ? '#3f3f46' : '#e4e4e7'; // zinc-700 and zinc-200
            const bgColor = isDark ? '#27272a' : '#f4f4f5'; // zinc-800 and zinc-100
            return {
                backgroundImage: `
                    linear-gradient(45deg, ${gridColor} 25%, transparent 25%), 
                    linear-gradient(-45deg, ${gridColor} 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, ${gridColor} 75%), 
                    linear-gradient(-45deg, transparent 75%, ${gridColor} 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: bgColor
            };
        }
        return { backgroundColor: background };
    }, [background, theme]);

    return (
        <div 
            style={backgroundStyle}
            className="w-full aspect-square rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden relative transition-colors bg-white dark:bg-zinc-800"
        >
            {isLoading && <LoadingSpinner />}
            {error && !isLoading && <p className="text-red-500 text-xs p-2 text-center">{error}</p>}
            
            {shadowUrl && (
                 <img
                    key={`${shadowUrl}-shadow`}
                    src={shadowUrl}
                    alt="Scene7 Shadow Preview"
                    style={{ mixBlendMode: 'multiply' }}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
                />
            )}
            <img
                ref={imgRef}
                key={url}
                src={url}
                alt="Scene7 Preview"
                className={`relative object-contain max-w-full max-h-full transition-opacity duration-300 ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
            />
        </div>
    );
};


interface PreviewProps {
    urls: string[];
    shadowUrls?: string[];
    background: string;
}

const Preview: React.FC<PreviewProps> = ({ urls, shadowUrls = [], background }) => {
    const hasUrls = urls.length > 0;
    const isGrid = urls.length > 1;

    // Always use the grid style for consistency, even for a single image
    return (
        <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">Live Preview</h3>
            <div className="w-full grid grid-cols-2 gap-4">
                {!hasUrls && (
                    <div className="w-full aspect-square rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center">
                         <p className="text-zinc-400 dark:text-zinc-500 text-sm">Enter image URLs to see a preview</p>
                    </div>
                )}
                {hasUrls && urls.map((url, index) => (
                    <PreviewItem 
                        key={`${url}-${index}`}
                        url={url} 
                        shadowUrl={shadowUrls[index]} 
                        background={background} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Preview;