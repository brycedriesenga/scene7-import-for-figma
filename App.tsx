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
import ThemeToggle from './components/ThemeToggle';
import ControlCheckbox from './components/common/ControlCheckbox';

// --- Placement Options Component ---

interface PlacementOptionsProps {
    placementMode: 'new' | 'replace';
    setPlacementMode: (mode: 'new' | 'replace') => void;
    filterByName: boolean;
    setFilterByName: (value: boolean) => void;
    nameFilter: string;
    setNameFilter: (value: string) => void;
}

const RadioOption: React.FC<{
    id: string;
    label: string;
    description: string;
    value: 'new' | 'replace';
    checked: boolean;
    onChange: (value: 'new' | 'replace') => void;
}> = ({ id, label, description, value, checked, onChange }) => (
    <div 
        onClick={() => onChange(value)}
        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
            checked 
                ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400' 
                : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
        }`}
    >
        <input
            id={id}
            type="radio"
            name="placementMode"
            value={value}
            checked={checked}
            onChange={() => onChange(value)}
            className="h-4 w-4 text-yellow-400 focus:ring-yellow-500 border-zinc-300 dark:border-zinc-600"
        />
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-zinc-800 dark:text-zinc-200">{label}</label>
            <p className="text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
    </div>
);


const PlacementOptions: React.FC<PlacementOptionsProps> = ({
    placementMode,
    setPlacementMode,
    filterByName,
    setFilterByName,
    nameFilter,
    setNameFilter,
}) => {
    return (
        <div className="space-y-4">
             <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Placement Options</h3>
            <div className="grid grid-cols-1 gap-3">
                <RadioOption
                    id="newLayers"
                    label="Create new layers"
                    description="Places images on the canvas, ignoring selection."
                    value="new"
                    checked={placementMode === 'new'}
                    onChange={setPlacementMode}
                />
                 <RadioOption
                    id="replaceSelection"
                    label="Replace selected layers"
                    description="Replaces the fill of selected layers with images."
                    value="replace"
                    checked={placementMode === 'replace'}
                    onChange={setPlacementMode}
                />
            </div>
            
            {placementMode === 'replace' && (
                <div className="pl-4 pr-2 py-3 border-l-2 border-yellow-400 space-y-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-r-md">
                     <ControlCheckbox
                        label="Filter selection by layer name"
                        checked={filterByName}
                        onChange={(e) => setFilterByName(e.target.checked)}
                        description="Only replace layers whose name contains specific text."
                    />
                    {filterByName && (
                         <div>
                            <input
                                type="text"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                placeholder="e.g. 'Product Image'"
                                className="w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md p-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// --- Main App Component ---

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
    const [placementMode, setPlacementMode] = useState<'new' | 'replace'>('new');
    const [filterByName, setFilterByName] = useState<boolean>(false);
    const [nameFilter, setNameFilter] = useState<string>('Product Image');

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

        console.log("Placing multiple images:", { images: imagesToPlace, mode: placementMode });
        
        parent.postMessage({
            pluginMessage: {
                type: 'PLACE_IMAGES',
                images: imagesToPlace,
                options: {
                    placementMode,
                    filterByName,
                    nameFilter
                }
            }
        }, '*');
    };

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 min-h-screen font-sans transition-colors duration-300">
            <div className="p-6 space-y-6 max-w-lg mx-auto relative">
                <ThemeToggle />
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

                <PlacementOptions
                    placementMode={placementMode}
                    setPlacementMode={setPlacementMode}
                    filterByName={filterByName}
                    setFilterByName={setFilterByName}
                    nameFilter={nameFilter}
                    setNameFilter={setNameFilter}
                />

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