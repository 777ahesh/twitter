import React, { useState } from 'react';

const PostButton = ({ tweetData, onPost }) => {
    const [posting, setPosting] = useState(false);

    // Safety checks
    if (!tweetData) {
        return null;
    }

    let tweets, isThread;
    
    // Handle different data structures
    if (tweetData.tweets && Array.isArray(tweetData.tweets)) {
        tweets = tweetData.tweets;
        isThread = tweetData.isThread || tweets.length > 1;
    } else if (typeof tweetData === 'string') {
        tweets = [tweetData];
        isThread = false;
    } else if (tweetData.tweet) {
        tweets = [tweetData.tweet];
        isThread = false;
    } else {
        return null;
    }

    const handlePost = async () => {
        setPosting(true);
        try {
            await onPost({ tweets, isThread });
        } catch (error) {
            console.error('Error posting:', error);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="post-button-container" style={{ textAlign: 'center', margin: '20px 0' }}>
            <button 
                onClick={handlePost}
                disabled={posting}
                className="post-button"
                style={{
                    backgroundColor: '#1da1f2',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: posting ? 'not-allowed' : 'pointer',
                    opacity: posting ? 0.6 : 1
                }}
            >
                {posting ? 'Posting...' : isThread ? `Post Thread (${tweets.length} tweets)` : 'Post Tweet'}
            </button>
        </div>
    );
};

export default PostButton;