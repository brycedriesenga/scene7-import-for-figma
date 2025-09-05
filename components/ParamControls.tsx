import React from 'react';
import { Scene7Params } from '../types';
import ControlSelect from './common/ControlSelect';
import ControlCheckbox from './common/ControlCheckbox';

interface ParamControlsProps {
    params: Scene7Params;
    setParams: React.Dispatch<React.SetStateAction<Scene7Params>>;
    addShadowLayer: boolean;
    setAddShadowLayer: (value: boolean) => void;
}

const ParamControls: React.FC<ParamControlsProps> = ({ params, setParams, addShadowLayer, setAddShadowLayer }) => {
    
    const handleParamChange = <K extends keyof Scene7Params>(param: K, value: Scene7Params[K]) => {
        setParams(prev => ({ ...prev, [param]: value }));
    };

    return (
        <div className="space-y-4 p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            
            <ControlCheckbox
                label="Create Shadow Layer"
                checked={addShadowLayer}
                onChange={(e) => setAddShadowLayer(e.target.checked)}
                description="Places a second, multiplied layer underneath for shadows."
            />
        </div>
    );
};

export default ParamControls;