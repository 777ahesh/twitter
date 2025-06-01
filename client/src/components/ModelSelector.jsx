import React, { useState, useEffect, useCallback } from 'react';
import ModelStatusChecker from './ModelStatusChecker';

const ModelSelector = ({ selectedModel, onModelChange }) => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchModels = useCallback(async () => {
        try {
            const response = await fetch('https://twitter-gmy4.onrender.com/api/tweets/models');
            const data = await response.json();
            setModels(data.models);
            
            // Set default model if none selected
            if (!selectedModel && data.models.length > 0) {
                onModelChange('zephyr-7b-beta'); // Default to working model
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            setError('Failed to load models');
        } finally {
            setLoading(false);
        }
    }, [selectedModel, onModelChange]);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    if (loading) {
        return (
            <div className="model-selector">
                <label>AI Model:</label>
                <div className="model-loading">Loading models...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="model-selector">
                <label>AI Model:</label>
                <div className="model-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="model-selector">
            <label htmlFor="model-select" className="model-label">
                🤖 AI Model:
            </label>
            <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="model-select"
            >
                {models.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name}
                    </option>
                ))}
            </select>
            
            <ModelStatusChecker selectedModel={selectedModel} />
            
            {selectedModel && (
                <div className="model-description">
                    {models.find(m => m.id === selectedModel)?.description}
                </div>
            )}
            
            <div className="model-info">
                💡 <strong>Tip:</strong> If a model fails, the system will automatically fallback to Zephyr 7B Beta or the local generator.
            </div>
        </div>
    );
};

export default ModelSelector;