import React, { useState, useEffect } from 'react';
import TweetGenerator from './components/TweetGenerator';
import AuthButton from './components/AuthButton';
import { postTweet } from './services/api';
import './App.css';

const App = () => {
    const [generatedTweet, setGeneratedTweet] = useState(null);
    const [accessToken, setAccessToken] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check URL for access token (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');
        
        if (token) {
            setAccessToken(token);
            setIsAuthenticated(true);
            // Store tokens in localStorage for persistence
            localStorage.setItem('twitter_access_token', token);
            if (refreshToken) {
                localStorage.setItem('twitter_refresh_token', refreshToken);
            }
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // Check localStorage for existing token
            const storedToken = localStorage.getItem('twitter_access_token');
            if (storedToken) {
                setAccessToken(storedToken);
                setIsAuthenticated(true);
            }
        }
    }, []);

    const handleTweetGeneration = (tweetData) => {
        console.log('App received tweet data:', tweetData);
        console.log('Type of tweet data:', typeof tweetData);
        
        // Ensure we're setting a proper object
        if (typeof tweetData === 'string') {
            setGeneratedTweet({
                tweets: [tweetData],
                isThread: false
            });
        } else if (tweetData && typeof tweetData === 'object') {
            // Ensure the object has the right structure
            const processedData = {
                tweets: tweetData.tweets || (tweetData.tweet ? [tweetData.tweet] : []),
                isThread: tweetData.isThread || false,
                ...(tweetData.article && { article: tweetData.article })
            };
            console.log('Setting processed tweet data:', processedData);
            setGeneratedTweet(processedData);
        } else {
            console.error('Invalid tweet data received:', tweetData);
            setGeneratedTweet(null);
        }
    };

    const handlePostTweet = async (tweetData) => {
        if (!isAuthenticated) {
            alert('Please authenticate with Twitter first!');
            return;
        }
        
        try {
            console.log('Posting tweet data:', tweetData);
            
            // Ensure tweetData has the right structure
            let dataToPost = tweetData;
            if (typeof tweetData === 'string') {
                dataToPost = {
                    tweets: [tweetData],
                    isThread: false
                };
            }
            
            await postTweet(dataToPost, accessToken);
            alert(dataToPost.isThread ? 'Thread posted successfully!' : 'Tweet posted successfully!');
        } catch (error) {
            console.error('Error posting tweet:', error);
            alert('Error posting tweet: ' + error.message);
        }
    };

    const handleLogout = () => {
        setAccessToken('');
        setIsAuthenticated(false);
        setGeneratedTweet(null);
        localStorage.removeItem('twitter_access_token');
        localStorage.removeItem('twitter_refresh_token');
    };

    // Debug current state
    console.log('App state - generatedTweet:', generatedTweet);

    return (
        <div className="App">
            <div className="container">
                <h1>🐦 Twitter Post Generator</h1>
                
                {!isAuthenticated ? (
                    <AuthButton />
                ) : (
                    <>
                        <div className="auth-status" style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '10px',
                            backgroundColor: '#e8f5e8',
                            borderRadius: '5px',
                            marginBottom: '20px'
                        }}>
                            <span>✅ Authenticated with Twitter</span>
                            <button onClick={handleLogout} className="logout-btn" style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '5px 15px',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}>
                                Logout
                            </button>
                        </div>
                        <TweetGenerator 
                            onTweetGenerate={handleTweetGeneration}
                            onPostTweet={handlePostTweet}
                            generatedTweet={generatedTweet}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default App;