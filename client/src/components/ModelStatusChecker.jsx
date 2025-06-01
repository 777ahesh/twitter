import React, { useState, useEffect } from 'react';

const ModelStatusChecker = ({ selectedModel }) => {
    const [status, setStatus] = useState('ready');
    const [message, setMessage] = useState('');

    useEffect(() => {
        checkModelStatus(selectedModel);
    }, [selectedModel]);

    const checkModelStatus = (model) => {
        if (model.startsWith('local-')) {
            setStatus('ready');
            setMessage('Always available - no internet required');
        } else if (model.startsWith('gemini-2.0-flash')) {
            setStatus('ready');
            setMessage('Latest Gemini 2.0 - 15-30 RPM, high performance');
        } else if (model.startsWith('gemini-2.5-flash')) {
            setStatus('ready');
            setMessage('Preview model - 10 RPM, cutting-edge features');
        } else if (model.startsWith('gemini-1.5-flash')) {
            setStatus('ready');
            setMessage('Stable Gemini 1.5 - 15 RPM, reliable performance');
        } else if (model.startsWith('gemma-3')) {
            setStatus('ready');
            setMessage('Open source Gemma - 30 RPM, compact model');
        } else if (model === 'zephyr-7b-beta') {
            setStatus('warning');
            setMessage('Hugging Face model - may have limited availability');
        } else {
            setStatus('ready');
            setMessage('AI model - free tier available');
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'ready': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return '✅';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'ready': return '#28a745';
            case 'warning': return '#ffc107';
            case 'error': return '#dc3545';
            default: return '#28a745';
        }
    };

    const getModelInfo = () => {
        if (selectedModel.startsWith('gemini-')) {
            let modelType = 'Google Gemini AI';
            let features = '';
            
            if (selectedModel.includes('2.0-flash')) {
                features = 'Latest generation with enhanced reasoning';
            } else if (selectedModel.includes('2.5-flash')) {
                features = 'Preview model with experimental capabilities';
            } else if (selectedModel.includes('1.5-flash')) {
                features = 'Stable and reliable for production use';
            } else if (selectedModel.includes('gemma')) {
                features = 'Open source model from Google';
            }
            
            return (
                <div className="model-extra-info">
                    🤖 <strong>{modelType}</strong> - {features}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="model-status-container">
            <div className="model-status" style={{ color: getStatusColor() }}>
                <span className="status-icon">{getStatusIcon()}</span>
                <span className="status-message">{message}</span>
            </div>
            {getModelInfo()}
        </div>
    );
};

export default ModelStatusChecker;