import React, { useState, useEffect } from 'react';
import { generateTweet, generateTweetFromArticle } from '../services/api';
import TweetPreview from './TweetPreview';
import PostButton from './PostButton';
import ModelSelector from './ModelSelector';
import ThreadToggle from './ThreadToggle';
import ModelStatusChecker from './ModelStatusChecker';

const TweetGenerator = ({ onTweetGenerate, onPostTweet, generatedTweet }) => {
    const [topic, setTopic] = useState('');
    const [additionalInstructions, setAdditionalInstructions] = useState('');
    const [imageInput, setImageInput] = useState('');
    const [imageType, setImageType] = useState('url'); // 'url' or 'upload'
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [isThreadMode, setIsThreadMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [models, setModels] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showOptionalFields, setShowOptionalFields] = useState(false);
    const [generationStats, setGenerationStats] = useState(null);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await fetch('https://twitter-gmy4.onrender.com/api/tweets/models');
            const data = await response.json();
            setModels(data.models || []);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const handleGenerateTweet = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic to generate content');
            return;
        }
        
        setLoading(true);
        setError('');
        setGenerationStats(null);
        
        const startTime = Date.now();
        
        try {
            console.log('Generating with preferences:', {
                topic: topic.trim(),
                additionalInstructions: additionalInstructions.trim(),
                model: selectedModel,
                threadMode: isThreadMode,
                imageInput: imageInput.trim(),
                imageType,
                hasUploadedFile: !!uploadedFile
            });
            
            // Prepare the enhanced prompt
            let enhancedTopic = topic.trim();
            if (additionalInstructions.trim()) {
                enhancedTopic += `\n\nAdditional Instructions: ${additionalInstructions.trim()}`;
            }
            
            // Prepare image data
            let imageData = null;
            if (imageType === 'url' && imageInput.trim()) {
                imageData = {
                    type: 'url',
                    source: imageInput.trim()
                };
            } else if (imageType === 'upload' && uploadedFile) {
                imageData = {
                    type: 'upload',
                    file: uploadedFile,
                    filename: uploadedFile.name
                };
            }
            
            const response = await generateTweet(enhancedTopic, selectedModel, {
                forceThread: isThreadMode,
                forceSingle: !isThreadMode,
                imageData: imageData
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log('API Response:', response);
            
            let tweetData;
            if (response.tweets && Array.isArray(response.tweets)) {
                tweetData = {
                    tweets: response.tweets,
                    isThread: response.isThread || response.tweets.length > 1,
                    model: response.model,
                    requestedMode: isThreadMode ? 'Thread' : 'Single Tweet',
                    generatedAt: new Date().toISOString(),
                    imageData: imageData,
                    additionalInstructions: additionalInstructions.trim() || null
                };
            } else if (response.tweet) {
                tweetData = {
                    tweets: [response.tweet],
                    isThread: false,
                    model: response.model,
                    requestedMode: isThreadMode ? 'Thread' : 'Single Tweet',
                    generatedAt: new Date().toISOString(),
                    imageData: imageData,
                    additionalInstructions: additionalInstructions.trim() || null
                };
            } else if (typeof response === 'string') {
                tweetData = {
                    tweets: [response],
                    isThread: false,
                    requestedMode: isThreadMode ? 'Thread' : 'Single Tweet',
                    generatedAt: new Date().toISOString(),
                    imageData: imageData,
                    additionalInstructions: additionalInstructions.trim() || null
                };
            } else {
                throw new Error('Invalid response format');
            }
            
            setGenerationStats({
                duration,
                characterCount: tweetData.tweets.join('').length,
                tweetCount: tweetData.tweets.length,
                model: selectedModel,
                hasImage: !!imageData,
                hasInstructions: !!additionalInstructions.trim()
            });
            
            onTweetGenerate(tweetData);
        } catch (error) {
            console.error('Error generating tweet:', error);
            setError(error.response?.data?.error || error.message || 'Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchArticleTweet = async () => {
        setLoading(true);
        setError('');
        setGenerationStats(null);
        
        const startTime = Date.now();
        
        try {
            const response = await generateTweetFromArticle();
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log('Article API Response:', response);
            
            let tweetData;
            if (response.tweets && Array.isArray(response.tweets)) {
                tweetData = {
                    tweets: response.tweets,
                    isThread: response.isThread || response.tweets.length > 1,
                    article: response.article,
                    requestedMode: 'Article-based',
                    generatedAt: new Date().toISOString()
                };
            } else if (response.tweet) {
                tweetData = {
                    tweets: [response.tweet],
                    isThread: false,
                    article: response.article,
                    requestedMode: 'Article-based',
                    generatedAt: new Date().toISOString()
                };
            } else {
                throw new Error('Invalid response format');
            }
            
            setGenerationStats({
                duration,
                characterCount: tweetData.tweets.join('').length,
                tweetCount: tweetData.tweets.length,
                source: 'Article'
            });
            
            onTweetGenerate(tweetData);
        } catch (error) {
            console.error('Error generating tweet from article:', error);
            setError(error.response?.data?.error || error.message || 'Failed to generate content from article');
        } finally {
            setLoading(false);
        }
    };

    const handleTweetUpdate = (updatedTweetData) => {
        console.log('Tweet updated:', updatedTweetData);
        onTweetGenerate(updatedTweetData);
    };

    const handleThreadToggle = (threadMode) => {
        setIsThreadMode(threadMode);
        console.log('Thread mode changed to:', threadMode);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }
            
            // Validate file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setError('Image file must be smaller than 5MB');
                return;
            }
            
            setUploadedFile(file);
            setError('');
        }
    };

    const removeUploadedFile = () => {
        setUploadedFile(null);
        // Reset file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const clearAll = () => {
        setTopic('');
        setAdditionalInstructions('');
        setImageInput('');
        setUploadedFile(null);
        setError('');
        setGenerationStats(null);
        onTweetGenerate(null);
        // Reset file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const getTopicSuggestions = () => [
        'Latest AI developments and trends',
        'React 18 new features and benefits',
        'Python productivity tips and tricks',
        'Web development best practices',
        'Machine learning for beginners',
        'Remote work productivity hacks',
        'Startup growth strategies',
        'Digital marketing insights'
    ];

    return (
        <div className="tweet-generator">
            {/* Header Section */}
            <div className="generator-header">
                <div className="header-content">
                    <h1 className="main-title">
                        <span className="title-icon">🐦</span>
                        AI Tweet Generator
                    </h1>
                    <p className="subtitle">Create engaging Twitter content with advanced AI models</p>
                </div>
                <button 
                    className="clear-button"
                    onClick={clearAll}
                    disabled={loading}
                    title="Clear all fields"
                >
                    <span>🗑️</span>
                    Clear
                </button>
            </div>

            <div className="generator-container">
                {/* Configuration Panel */}
                <div className="config-panel">
                    <div className="panel-header">
                        <h3>⚙️ Configuration</h3>
                        <button 
                            className="advanced-toggle"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? '👆 Basic' : '👇 Advanced'}
                        </button>
                    </div>

                    {/* Model Selection */}
                    <ModelSelector 
                        models={models}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        disabled={loading}
                    />

                    {/* Model Status */}
                    {showAdvanced && (
                        <ModelStatusChecker selectedModel={selectedModel} />
                    )}

                    {/* Thread Toggle */}
                    <ThreadToggle
                        isThreadMode={isThreadMode}
                        onToggle={handleThreadToggle}
                        disabled={loading}
                    />
                </div>

                {/* Input Panel */}
                <div className="input-panel">
                    <div className="panel-header">
                        <h3>💭 Content Input</h3>
                        <div className="input-stats">
                            <span className="char-count">{topic.length} characters</span>
                            <button 
                                className="optional-toggle"
                                onClick={() => setShowOptionalFields(!showOptionalFields)}
                            >
                                {showOptionalFields ? '🔼 Hide Optional' : '🔽 Show Optional'}
                            </button>
                        </div>
                    </div>

                    {/* Main Topic Input */}
                    <div className="input-group">
                        <label htmlFor="topic-input" className="input-label required">
                            What would you like to tweet about? *
                        </label>
                        <div className="input-wrapper">
                            <textarea
                                id="topic-input"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter your topic, idea, or what you want to share...&#10;&#10;Examples:&#10;• Latest developments in AI and machine learning&#10;• React 18 features and performance improvements&#10;• Python tips for data science beginners"
                                className="topic-textarea"
                                disabled={loading}
                                rows={4}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !loading) {
                                        e.preventDefault();
                                        handleGenerateTweet();
                                    }
                                }}
                            />
                            <div className="input-overlay">
                                <button 
                                    className="voice-input-button"
                                    title="Voice input (coming soon)"
                                    disabled
                                >
                                    🎤
                                </button>
                            </div>
                        </div>
                        
                        <div className="input-help">
                            <div className="help-text">
                                💡 <strong>Pro tip:</strong> Be specific for better results. Press Ctrl+Enter to generate.
                            </div>
                        </div>
                    </div>

                    {/* Optional Fields */}
                    {showOptionalFields && (
                        <div className="optional-fields">
                            <div className="optional-header">
                                <h4>🎯 Optional Enhancements</h4>
                                <p>Add extra context and media to make your tweets more engaging</p>
                            </div>

                            {/* Additional Instructions */}
                            <div className="input-group">
                                <label htmlFor="instructions-input" className="input-label optional">
                                    <span className="label-content">
                                        📝 Additional Instructions (Optional)
                                        <span className="optional-badge">Optional</span>
                                    </span>
                                </label>
                                <div className="input-wrapper">
                                    <textarea
                                        id="instructions-input"
                                        value={additionalInstructions}
                                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                                        placeholder="Add specific instructions for the AI...&#10;&#10;Examples:&#10;• Make it more technical and include code examples&#10;• Focus on business benefits and ROI&#10;• Use a casual, friendly tone&#10;• Include actionable tips&#10;• Make it inspirational and motivational"
                                        className="instructions-textarea"
                                        disabled={loading}
                                        rows={3}
                                        maxLength={500}
                                    />
                                    <div className="char-counter">
                                        <span className={additionalInstructions.length > 450 ? 'warning' : 'normal'}>
                                            {additionalInstructions.length}/500
                                        </span>
                                    </div>
                                </div>
                                <div className="input-help">
                                    <div className="help-text">
                                        ✨ <strong>Examples:</strong> "Make it technical", "Focus on business value", "Use emojis", "Include statistics"
                                    </div>
                                </div>
                            </div>

                            {/* Image/Media Input */}
                            <div className="input-group">
                                <label className="input-label optional">
                                    <span className="label-content">
                                        🖼️ Add Image (Optional)
                                        <span className="optional-badge">Optional</span>
                                    </span>
                                </label>
                                
                                {/* Image Type Toggle */}
                                <div className="image-type-toggle">
                                    <div className="toggle-buttons">
                                        <button
                                            type="button"
                                            className={`toggle-button ${imageType === 'url' ? 'active' : ''}`}
                                            onClick={() => {
                                                setImageType('url');
                                                setUploadedFile(null);
                                            }}
                                            disabled={loading}
                                        >
                                            🔗 URL
                                        </button>
                                        <button
                                            type="button"
                                            className={`toggle-button ${imageType === 'upload' ? 'active' : ''}`}
                                            onClick={() => {
                                                setImageType('upload');
                                                setImageInput('');
                                            }}
                                            disabled={loading}
                                        >
                                            📁 Upload
                                        </button>
                                    </div>
                                </div>

                                {/* URL Input */}
                                {imageType === 'url' && (
                                    <div className="input-wrapper">
                                        <input
                                            type="url"
                                            value={imageInput}
                                            onChange={(e) => setImageInput(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="image-url-input"
                                            disabled={loading}
                                        />
                                        <div className="input-icon">🔗</div>
                                    </div>
                                )}

                                {/* File Upload */}
                                {imageType === 'upload' && (
                                    <div className="file-upload-wrapper">
                                        {!uploadedFile ? (
                                            <div className="file-upload-area">
                                                <input
                                                    type="file"
                                                    id="image-upload"
                                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                    onChange={handleImageUpload}
                                                    className="file-input"
                                                    disabled={loading}
                                                />
                                                <label htmlFor="image-upload" className="file-upload-label">
                                                    <div className="upload-content">
                                                        <div className="upload-icon">📸</div>
                                                        <div className="upload-text">
                                                            <strong>Click to upload</strong> or drag and drop
                                                        </div>
                                                        <div className="upload-hint">
                                                            PNG, JPG, GIF, WebP up to 5MB
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="uploaded-file">
                                                <div className="file-info">
                                                    <div className="file-icon">📎</div>
                                                    <div className="file-details">
                                                        <div className="file-name">{uploadedFile.name}</div>
                                                        <div className="file-size">
                                                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeUploadedFile}
                                                        className="remove-file-button"
                                                        title="Remove file"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="input-help">
                                    <div className="help-text">
                                        📷 <strong>Note:</strong> Images will be attached to your tweet when posting. Supported formats: JPEG, PNG, GIF, WebP.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Topic Suggestions */}
                    {!topic && !showOptionalFields && (
                        <div className="topic-suggestions">
                            <h4>✨ Popular Topics</h4>
                            <div className="suggestions-grid">
                                {getTopicSuggestions().map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="suggestion-chip"
                                        onClick={() => setTopic(suggestion)}
                                        disabled={loading}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button 
                            onClick={handleGenerateTweet} 
                            disabled={loading || !topic.trim()}
                            className="generate-button primary"
                        >
                            <span className="button-content">
                                {loading ? (
                                    <>
                                        <span className="loading-spinner">⏳</span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span className="button-icon">✨</span>
                                        Generate {isThreadMode ? 'Thread' : 'Tweet'}
                                    </>
                                )}
                            </span>
                        </button>
                        
                        <button 
                            onClick={handleFetchArticleTweet}
                            disabled={loading}
                            className="generate-button secondary"
                        >
                            <span className="button-content">
                                {loading ? (
                                    <>
                                        <span className="loading-spinner">⏳</span>
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <span className="button-icon">📰</span>
                                        Generate from Article
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="error-panel">
                        <div className="error-content">
                            <span className="error-icon">⚠️</span>
                            <div className="error-text">
                                <strong>Something went wrong</strong>
                                <p>{error}</p>
                            </div>
                            <button 
                                className="error-dismiss"
                                onClick={() => setError('')}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Generation Stats */}
                {generationStats && (
                    <div className="stats-panel">
                        <h4>📊 Generation Stats</h4>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Duration</span>
                                <span className="stat-value">{generationStats.duration}ms</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Characters</span>
                                <span className="stat-value">{generationStats.characterCount}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Tweets</span>
                                <span className="stat-value">{generationStats.tweetCount}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Model</span>
                                <span className="stat-value">{generationStats.model || generationStats.source}</span>
                            </div>
                            {generationStats.hasImage && (
                                <div className="stat-item">
                                    <span className="stat-label">Media</span>
                                    <span className="stat-value">📷 Image</span>
                                </div>
                            )}
                            {generationStats.hasInstructions && (
                                <div className="stat-item">
                                    <span className="stat-label">Instructions</span>
                                    <span className="stat-value">📝 Custom</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Generated Content */}
                {generatedTweet && (
                    <div className="result-panel">
                        <TweetPreview 
                            tweetData={generatedTweet} 
                            onTweetUpdate={handleTweetUpdate}
                        />
                        <PostButton tweetData={generatedTweet} onPost={onPostTweet} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TweetGenerator;