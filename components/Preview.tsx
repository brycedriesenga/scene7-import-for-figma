import React, { useState, useEffect, useMemo, useRef } from 'react';
import LoadingSpinner from './common/LoadingSpinner';

const PreviewItem: React.FC<{ url: string; shadowUrl?: string; background: string; }> = ({ url, shadowUrl, background }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

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
            return {
                backgroundImage: `
                    linear-gradient(45deg, #666 25%, transparent 25%), 
                    linear-gradient(-45deg, #666 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #666 75%), 
                    linear-gradient(-45deg, transparent 75%, #666 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#555'
            };
        }
        return { backgroundColor: background };
    }, [background]);

    return (
        <div 
            style={backgroundStyle}
            className="w-full aspect-square rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden relative transition-colors"
        >
            {isLoading && <LoadingSpinner />}
            {error && !isLoading && <p className="text-red-400 text-xs p-2 text-center">{error}</p>}
            
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

    return (
        <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Live Preview</h3>
            <div 
                className={`w-full ${
                    isGrid
                        ? 'grid grid-cols-2 gap-4'
                        : ''
                }`}
            >
                {!hasUrls && (
                    <div className="w-full aspect-square rounded-lg border border-dashed border-gray-600 flex items-center justify-center">
                         <p className="text-gray-500 text-sm">Enter image URLs to see a preview</p>
                    </div>
                )}
                
                {hasUrls && isGrid && (
                    urls.map((url, index) => (
                        <PreviewItem 
                            key={`${url}-${index}`}
                            url={url} 
                            shadowUrl={shadowUrls[index]} 
                            background={background} 
                        />
                    ))
                )}

                {hasUrls && !isGrid && (
                    <PreviewItem url={urls[0]} shadowUrl={shadowUrls[0]} background={background} />
                )}
            </div>
        </div>
    );
};

export default Preview;