import React from 'react';

const ThreadToggle = ({ isThreadMode, onToggle, disabled = false }) => {
    return (
        <div className="thread-toggle-container">
            <div className="toggle-header">
                <label className="thread-toggle-label">
                    <span className="label-icon">📝</span>
                    Content Format
                </label>
                <div className="toggle-hint">
                    Choose how your content should be formatted
                </div>
            </div>
            
            <div className="thread-toggle-wrapper">
                <div className="toggle-slider">
                    <input
                        type="radio"
                        id="single-tweet"
                        name="content-format"
                        checked={!isThreadMode}
                        onChange={() => onToggle(false)}
                        disabled={disabled}
                    />
                    <label htmlFor="single-tweet" className="toggle-option single-option">
                        <div className="option-content">
                            <div className="option-header">
                                <span className="toggle-icon">📄</span>
                                <span className="toggle-text">Single Tweet</span>
                            </div>
                            <span className="toggle-description">Condensed to 280 characters</span>
                            <div className="option-features">
                                <span className="feature">• Quick to read</span>
                                <span className="feature">• Maximum impact</span>
                            </div>
                        </div>
                    </label>

                    <input
                        type="radio"
                        id="thread-mode"
                        name="content-format"
                        checked={isThreadMode}
                        onChange={() => onToggle(true)}
                        disabled={disabled}
                    />
                    <label htmlFor="thread-mode" className="toggle-option thread-option">
                        <div className="option-content">
                            <div className="option-header">
                                <span className="toggle-icon">🧵</span>
                                <span className="toggle-text">Thread</span>
                            </div>
                            <span className="toggle-description">Multiple connected tweets</span>
                            <div className="option-features">
                                <span className="feature">• Detailed content</span>
                                <span className="feature">• Better storytelling</span>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="thread-toggle-info">
                <div className={`info-content ${isThreadMode ? 'thread-active' : 'single-active'}`}>
                    {isThreadMode ? (
                        <div className="thread-info">
                            <div className="info-icon">🧵</div>
                            <div className="info-text">
                                <strong>Thread Mode Active</strong>
                                <p>Content will be intelligently split into numbered, connected tweets for better storytelling and engagement.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="single-info">
                            <div className="info-icon">📄</div>
                            <div className="info-text">
                                <strong>Single Tweet Mode Active</strong>
                                <p>Content will be condensed into one powerful tweet (max 280 characters) for maximum impact.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreadToggle;