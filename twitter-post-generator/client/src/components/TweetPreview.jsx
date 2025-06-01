import React, { useState } from 'react';

const TweetPreview = ({ tweetData, onTweetUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTweets, setEditedTweets] = useState([]);

    // Enhanced debug logging
    console.log('TweetPreview received tweetData:', tweetData);
    console.log('Type of tweetData:', typeof tweetData);
    console.log('Is tweetData an array?', Array.isArray(tweetData));

    // Safety checks
    if (!tweetData) {
        return (
            <div className="tweet-preview">
                <div className="no-data-message">
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No tweet generated yet</h3>
                        <p>Generate your first tweet to see the preview here</p>
                    </div>
                </div>
            </div>
        );
    }

    let tweets = [];
    let isThread = false;
    let article = null;
    
    // Handle different data structures with explicit type checking
    try {
        if (typeof tweetData === 'string') {
            console.log('Processing string tweetData');
            tweets = [tweetData];
            isThread = false;
        } else if (typeof tweetData === 'object' && tweetData !== null) {
            if (Array.isArray(tweetData)) {
                console.log('Processing array tweetData');
                tweets = tweetData.filter(item => typeof item === 'string');
                isThread = tweets.length > 1;
            } else if (tweetData.tweets && Array.isArray(tweetData.tweets)) {
                console.log('Processing object with tweets array');
                tweets = tweetData.tweets.filter(item => typeof item === 'string');
                isThread = tweetData.isThread || tweets.length > 1;
                article = tweetData.article || null;
            } else if (tweetData.tweet && typeof tweetData.tweet === 'string') {
                console.log('Processing object with single tweet');
                tweets = [tweetData.tweet];
                isThread = false;
                article = tweetData.article || null;
            } else {
                throw new Error('Invalid tweet data structure');
            }
        } else {
            throw new Error('Tweet data is not a string or object');
        }
    } catch (error) {
        console.error('Error processing tweet data:', error);
        console.error('Raw tweetData:', JSON.stringify(tweetData, null, 2));
        return (
            <div className="tweet-preview">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Invalid tweet data format</h3>
                    <p>Expected string or object with tweets array</p>
                    <details className="debug-details">
                        <summary>Debug information</summary>
                        <pre className="debug-code">
                            {JSON.stringify(tweetData, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        );
    }

    console.log('Processed tweets:', tweets);
    console.log('Is thread:', isThread);

    if (!tweets || tweets.length === 0) {
        return (
            <div className="tweet-preview">
                <div className="no-data-message">
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No tweets to display</h3>
                        <p>Something went wrong during generation</p>
                    </div>
                </div>
            </div>
        );
    }

    // Initialize edited tweets when starting to edit
    const handleStartEdit = () => {
        setEditedTweets([...tweets]);
        setIsEditing(true);
    };

    // Handle text change for specific tweet
    const handleTweetChange = (index, newText) => {
        const updatedTweets = [...editedTweets];
        updatedTweets[index] = newText;
        setEditedTweets(updatedTweets);
    };

    // Save edited tweets
    const handleSaveEdit = () => {
        // Filter out empty tweets
        const filteredTweets = editedTweets.filter(tweet => 
            typeof tweet === 'string' && tweet.trim().length > 0
        );
        
        if (filteredTweets.length === 0) {
            alert('At least one tweet must have content!');
            return;
        }

        // Check for over-limit tweets
        const overLimitTweets = filteredTweets.filter(tweet => tweet.length > 280);
        if (overLimitTweets.length > 0) {
            alert(`${overLimitTweets.length} tweet(s) exceed the 280 character limit. Please shorten them before saving.`);
            return;
        }

        const updatedTweetData = {
            tweets: filteredTweets,
            isThread: filteredTweets.length > 1,
            ...(article && { article })
        };
        
        console.log('Saving updated tweet data:', updatedTweetData);
        onTweetUpdate(updatedTweetData);
        setIsEditing(false);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditedTweets([]);
        setIsEditing(false);
    };

    // Add new tweet to thread
    const handleAddTweet = () => {
        setEditedTweets([...editedTweets, '']);
    };

    // Remove tweet from thread
    const handleRemoveTweet = (index) => {
        if (editedTweets.length > 1) {
            const updatedTweets = editedTweets.filter((_, i) => i !== index);
            setEditedTweets(updatedTweets);
        }
    };

    const tweetsToShow = isEditing ? editedTweets : tweets;
    
    return (
        <div className="tweet-preview">
            {/* Header Section */}
            <div className="tweet-preview-header">
                <div className="header-content">
                    <div className="header-title">
                        <h3 className="preview-title">
                            {isThread ? (
                                <>
                                    <span className="thread-icon">🧵</span>
                                    Tweet Thread
                                </>
                            ) : (
                                <>
                                    <span className="tweet-icon">📝</span>
                                    Tweet Preview
                                </>
                            )}
                        </h3>
                        <div className="tweet-count-badge">
                            {tweetsToShow.length} {tweetsToShow.length === 1 ? 'tweet' : 'tweets'}
                        </div>
                    </div>
                    <p className="preview-subtitle">
                        {isEditing ? 'Edit your content below' : 'Review your generated content'}
                    </p>
                </div>
                
                <div className="tweet-actions">
                    {!isEditing ? (
                        <button onClick={handleStartEdit} className="edit-button modern-button">
                            <span className="button-icon">✏️</span>
                            <span>Edit {isThread ? 'Thread' : 'Tweet'}</span>
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button onClick={handleSaveEdit} className="save-button modern-button primary">
                                <span className="button-icon">✅</span>
                                <span>Save Changes</span>
                            </button>
                            <button onClick={handleCancelEdit} className="cancel-button modern-button secondary">
                                <span className="button-icon">❌</span>
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Article Info */}
            {article && (
                <div className="article-info-card">
                    <div className="article-icon">📖</div>
                    <div className="article-content">
                        <div className="article-label">Based on article</div>
                        <div className="article-title">
                            {typeof article === 'string' ? article : article.title || 'Unknown article'}
                        </div>
                        {article.url && (
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
                                <span className="link-icon">🔗</span>
                                Read full article
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Tweets Container */}
            <div className="tweets-container">
                {tweetsToShow.map((tweet, index) => {
                    // Ensure tweet is a string
                    const tweetText = typeof tweet === 'string' ? tweet : JSON.stringify(tweet);
                    
                    return (
                        <div key={index} className={`tweet-card ${isEditing ? 'editing-mode' : 'preview-mode'}`}>
                            {/* Tweet Header */}
                            <div className="tweet-header">
                                <div className="tweet-user-info">
                                    <div className="user-avatar">
                                        <div className="avatar-circle">
                                            <span className="avatar-icon">👤</span>
                                        </div>
                                    </div>
                                    <div className="user-details">
                                        <div className="user-name">@YourUsername</div>
                                        <div className="tweet-time">
                                            <span className="time-icon">🕐</span>
                                            just now
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="tweet-meta">
                                    {isThread && (
                                        <div className="thread-indicator">
                                            <span className="thread-badge">
                                                🧵 {index + 1}/{tweetsToShow.length}
                                            </span>
                                        </div>
                                    )}
                                    {isEditing && tweetsToShow.length > 1 && (
                                        <button 
                                            onClick={() => handleRemoveTweet(index)} 
                                            className="remove-tweet-button"
                                            title="Remove this tweet"
                                        >
                                            <span className="remove-icon">🗑️</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tweet Content */}
                            <div className="tweet-content-wrapper">
                                {isEditing ? (
                                    <div className="tweet-editor-container">
                                        <textarea
                                            value={tweetText}
                                            onChange={(e) => handleTweetChange(index, e.target.value)}
                                            className="tweet-editor"
                                            placeholder="What's happening?"
                                            rows={4}
                                            maxLength={500}
                                        />
                                        <div className="editor-toolbar">
                                            <div className="editor-tools">
                                                <button className="editor-tool" title="Add emoji">
                                                    😀
                                                </button>
                                                <button className="editor-tool" title="Add hashtag">
                                                    #
                                                </button>
                                                <button className="editor-tool" title="Add mention">
                                                    @
                                                </button>
                                            </div>
                                            <div className="character-counter">
                                                <div className={`counter-text ${tweetText.length > 280 ? 'over-limit' : tweetText.length > 250 ? 'warning' : 'safe'}`}>
                                                    <span className="current-count">{tweetText.length}</span>
                                                    <span className="separator">/</span>
                                                    <span className="max-count">280</span>
                                                </div>
                                                <div className="counter-circle">
                                                    <svg width="20" height="20" viewBox="0 0 20 20">
                                                        <circle
                                                            cx="10"
                                                            cy="10"
                                                            r="9"
                                                            fill="none"
                                                            stroke="#e1e8ed"
                                                            strokeWidth="2"
                                                        />
                                                        <circle
                                                            cx="10"
                                                            cy="10"
                                                            r="9"
                                                            fill="none"
                                                            stroke={tweetText.length > 280 ? '#f7344c' : tweetText.length > 250 ? '#ffad1f' : '#1da1f2'}
                                                            strokeWidth="2"
                                                            strokeDasharray={`${(tweetText.length / 280) * 56.5} 56.5`}
                                                            strokeDashoffset="0"
                                                            transform="rotate(-90 10 10)"
                                                        />
                                                    </svg>
                                                </div>
                                                {tweetText.length > 280 && (
                                                    <div className="over-limit-warning">
                                                        <span className="warning-icon">⚠️</span>
                                                        <span className="over-count">+{tweetText.length - 280}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="tweet-content">
                                        <div className="tweet-text">{tweetText}</div>
                                        <div className="tweet-stats">
                                            <div className="stats-row">
                                                <div className={`character-count ${tweetText.length > 280 ? 'over-limit' : tweetText.length > 250 ? 'warning' : 'safe'}`}>
                                                    <span className="stats-icon">📊</span>
                                                    <span className="stats-text">
                                                        {tweetText.length}/280 characters
                                                    </span>
                                                </div>
                                                <div className="engagement-preview">
                                                    <div className="engagement-item">
                                                        <span className="engagement-icon">💬</span>
                                                        <span className="engagement-count">0</span>
                                                    </div>
                                                    <div className="engagement-item">
                                                        <span className="engagement-icon">🔄</span>
                                                        <span className="engagement-count">0</span>
                                                    </div>
                                                    <div className="engagement-item">
                                                        <span className="engagement-icon">❤️</span>
                                                        <span className="engagement-count">0</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Thread Controls */}
            {isEditing && (
                <div className="thread-controls">
                    <button onClick={handleAddTweet} className="add-tweet-button modern-button">
                        <span className="button-icon">➕</span>
                        <span>Add Another Tweet</span>
                    </button>
                    <div className="edit-tips">
                        <div className="tip-icon">💡</div>
                        <div className="tip-content">
                            <strong>Pro Tips:</strong>
                            <ul>
                                <li>Keep each tweet under 280 characters</li>
                                <li>Empty tweets will be removed when saving</li>
                                <li>Use emojis to make your content more engaging</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TweetPreview;