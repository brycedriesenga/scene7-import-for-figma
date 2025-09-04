import React, { useState, useMemo, useEffect } from 'react';
import { Scene7Params } from './types';
import { SCENE7_BASE_URL, DEFAULT_PARAMS } from './constants';
import { useDebounce } from './hooks/useDebounce';

import Header from './components/Header';
import ImageNameInput from './components/ImageNameInput';
import ParamControls from './components/ParamControls';
import Preview from './components/Preview';
import Button from './components/common/Button';
import BackgroundControls from './components/BackgroundControls';

const extractImageName = (urlOrName: string): string => {
    const trimmed = urlOrName.trim();
    if (!trimmed) return '';
    // If it's a full URL, extract the name part.
    if (trimmed.startsWith('http')) {
        const match = trimmed.match(/WolverineWorldWide\/([^?$]+)/);
        if (match && match[1]) {
            return match[1];
        }
    }
    // Otherwise, assume it's just the name.
    return trimmed;
};


const App: React.FC = () => {
    const [rawInput, setRawInput] = useState<string>('MRLW-J068674-090524-F25-000');
    const [imageNames, setImageNames] = useState<string[]>([]);
    const [params, setParams] = useState<Scene7Params>(DEFAULT_PARAMS);
    const [addShadowLayer, setAddShadowLayer] = useState<boolean>(true);
    const [previewBackground, setPreviewBackground] = useState<string>('transparent');

    useEffect(() => {
        const names = rawInput
            .split('\n')
            .map(extractImageName)
            .filter(Boolean); // Filter out empty lines
        setImageNames(names);
    }, [rawInput]);

    const buildUrl = (name: string, p: Scene7Params): string => {
        if (!name) return '';

        const queryParams = Object.entries(p)
            .filter(([, value]) => value !== '' && value !== null && value !== undefined && value !== false)
            .map(([key, value]) => {
                if (key === 'clipPathE' && typeof value === 'string') {
                    // Specific encoding for clipPathE to handle spaces
                    return `${key}=${encodeURIComponent(value)}`;
                }
                 if (value === true) {
                    return `${key}=1`;
                }
                return `${key}=${value}`;
            })
            .join('&');
        
        return `${SCENE7_BASE_URL}${name}?${queryParams}`;
    };

    const finalUrls = useMemo(() => {
        return imageNames.map(name => buildUrl(name, params));
    }, [imageNames, params]);
    
    const shadowUrls = useMemo(() => {
        if (!addShadowLayer) return imageNames.map(() => '');

        return imageNames.map(name => {
            const shadowParams: Scene7Params = { ...params };
            delete shadowParams.clipPathE;
            delete shadowParams.pathEmbed;
            shadowParams.fmt = 'jpeg'; // Shadows look best on a solid background
            return buildUrl(name, shadowParams);
        });
    }, [imageNames, params, addShadowLayer]);

    const debouncedUrls = useDebounce(finalUrls, 300);
    const debouncedShadowUrls = useDebounce(shadowUrls, 300);

    const handlePlaceImage = () => {
         if (imageNames.length === 0) {
            console.error("No images to place.");
            return;
        }

        const imagesToPlace = imageNames.map((name, index) => ({
            imageName: name,
            topLayerUrl: finalUrls[index],
            shadowLayerUrl: addShadowLayer ? shadowUrls[index] : '',
        }));

        console.log("Placing multiple images:", { images: imagesToPlace });
        /*
        parent.postMessage({
            pluginMessage: {
                type: 'CREATE_MULTIPLE_IMAGES',
                images: imagesToPlace,
            }
        }, '*');
        */
    };

    return (
        <div className="bg-gray-800 text-white min-h-screen font-sans">
            <div className="p-4 space-y-6 max-w-md mx-auto">
                <Header />

                <ImageNameInput value={rawInput} onChange={setRawInput} />

                <ParamControls 
                    params={params} 
                    setParams={setParams}
                    addShadowLayer={addShadowLayer}
                    setAddShadowLayer={setAddShadowLayer}
                />

                <Preview urls={debouncedUrls} shadowUrls={debouncedShadowUrls} background={previewBackground} />
                
                <BackgroundControls selected={previewBackground} onChange={setPreviewBackground} />

                <div className="pt-2">
                    <Button onClick={handlePlaceImage} disabled={imageNames.length === 0}>
                        Place in Figma
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default App;