const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
require('dotenv').config();

class TwitterService {
    constructor() {
        this.client = new TwitterApi({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
        });
    }

    // Generate OAuth 2.0 authorization URL
    generateAuthUrl() {
        const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
            process.env.TWITTER_REDIRECT_URI,
            { 
                scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] 
            }
        );
        
        return { url, codeVerifier, state };
    }

    // Get access token from authorization code
    async getAccessToken(code, codeVerifier) {
        const { accessToken, refreshToken } = await this.client.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: process.env.TWITTER_REDIRECT_URI
        });

        return { accessToken, refreshToken };
    }

    // Upload media using v1.1 (this is allowed with OAuth 2.0)
    async uploadMedia(imageData, accessToken) {
        try {
            if (!imageData) return null;

            const client = new TwitterApi(accessToken);
            let mediaId;

            if (imageData.type === 'url') {
                // Download image from URL
                const response = await axios.get(imageData.source, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                const contentType = response.headers['content-type'] || 'image/jpeg';
                
                mediaId = await client.v1.uploadMedia(buffer, { mimeType: contentType });
            } else if (imageData.type === 'upload' && imageData.file) {
                // Handle uploaded file
                const buffer = imageData.file.buffer;
                const mimeType = imageData.file.mimetype || 'image/jpeg';
                
                mediaId = await client.v1.uploadMedia(buffer, { mimeType });
            }

            console.log('Media uploaded successfully, ID:', mediaId);
            return mediaId;
        } catch (error) {
            console.error('Error uploading media:', error);
            throw new Error(`Failed to upload media: ${error.message}`);
        }
    }

    // Post single tweet using v2 API (this is what you need to change)
    async postTweet(text, accessToken, options = {}) {
        try {
            const client = new TwitterApi(accessToken);
            
            // Prepare tweet options for v2 API
            const tweetOptions = { text };
            
            // Upload media first if provided
            if (options.imageData) {
                const mediaId = await this.uploadMedia(options.imageData, accessToken);
                if (mediaId) {
                    tweetOptions.media = { media_ids: [mediaId] };
                }
            }
            
            console.log('Posting tweet with options:', tweetOptions);
            
            // Use v2 API instead of v1.1
            const response = await client.v2.tweet(tweetOptions);
            
            console.log('Tweet posted successfully:', response.data);
            return response;
        } catch (error) {
            console.error('Error posting tweet:', error);
            throw error;
        }
    }

    // Post thread using v2 API (this is what you need to change)
    async postThread(tweets, accessToken, options = {}) {
        try {
            const client = new TwitterApi(accessToken);
            const responses = [];
            let previousTweetId = null;
            
            // Upload media first if provided (will be attached to first tweet only)
            let mediaId = null;
            if (options.imageData) {
                mediaId = await this.uploadMedia(options.imageData, accessToken);
            }
            
            for (let i = 0; i < tweets.length; i++) {
                const tweetOptions = { 
                    text: tweets[i] 
                };
                
                // Add media only to the first tweet
                if (i === 0 && mediaId) {
                    tweetOptions.media = { media_ids: [mediaId] };
                }
                
                // Add reply reference for thread continuity (except first tweet)
                if (previousTweetId) {
                    tweetOptions.reply = { in_reply_to_tweet_id: previousTweetId };
                }
                
                console.log(`Posting tweet ${i + 1}/${tweets.length} with options:`, tweetOptions);
                
                // Use v2 API instead of v1.1
                const response = await client.v2.tweet(tweetOptions);
                responses.push(response);
                
                previousTweetId = response.data.id;
                console.log(`Tweet ${i + 1} posted successfully:`, response.data.id);
                
                // Add small delay between tweets to avoid rate limiting
                if (i < tweets.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log(`Thread with ${tweets.length} tweets posted successfully`);
            return responses;
        } catch (error) {
            console.error('Error posting thread:', error);
            throw error;
        }
    }
}

module.exports = new TwitterService();