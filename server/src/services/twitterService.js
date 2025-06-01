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

    // Exchange authorization code for access token
    async getAccessToken(code, codeVerifier) {
        try {
            const { accessToken, refreshToken } = await this.client.loginWithOAuth2({
                code,
                codeVerifier,
                redirectUri: process.env.TWITTER_REDIRECT_URI,
            });
            
            return { accessToken, refreshToken };
        } catch (error) {
            throw new Error('Failed to get access token: ' + error.message);
        }
    }

    // Helper to upload image and get media_id
    async uploadImage(twitterClient, imageData) {
        // imageData can be a base64 string or a URL
        let imageBuffer;
        if (imageData.startsWith('http')) {
            // Download image from URL
            const response = await axios.get(imageData, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data, 'binary');
        } else if (imageData.startsWith('data:')) {
            // Base64 data URI
            const base64 = imageData.split(',')[1];
            imageBuffer = Buffer.from(base64, 'base64');
        } else {
            throw new Error('Unsupported image format');
        }
        // Upload to Twitter
        const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, { type: 'png' }); // or 'jpg'
        return mediaId;
    }

    // Post single tweet using access token
    async postTweet(tweetContent, accessToken, options = {}) {
        try {
            const twitterClient = new TwitterApi(accessToken);
            let mediaIds = [];
            if (options.imageData) {
                const mediaId = await this.uploadImage(twitterClient, options.imageData);
                mediaIds.push(mediaId);
            }
            const params = { status: tweetContent };
            if (mediaIds.length) {
                params.media_ids = mediaIds;
            }
            // v1.1 endpoint for media
            const response = await twitterClient.v1.tweet(params.status, { media_ids: mediaIds });
            return response;
        } catch (error) {
            throw new Error('Error posting tweet: ' + error.message);
        }
    }

    // Post tweet thread using access token
    async postThread(tweets, accessToken, options = {}) {
        try {
            const twitterClient = new TwitterApi(accessToken);
            let inReplyToStatusId = null;
            let responses = [];
            for (let i = 0; i < tweets.length; i++) {
                let mediaIds = [];
                if (i === 0 && options.imageData) {
                    const mediaId = await this.uploadImage(twitterClient, options.imageData);
                    mediaIds.push(mediaId);
                }
                const params = { status: tweets[i] };
                if (mediaIds.length) {
                    params.media_ids = mediaIds;
                }
                if (inReplyToStatusId) {
                    params.in_reply_to_status_id = inReplyToStatusId;
                    params.auto_populate_reply_metadata = true;
                }
                const response = await twitterClient.v1.tweet(params.status, params);
                inReplyToStatusId = response.id_str;
                responses.push(response);
            }
            return responses;
        } catch (error) {
            throw new Error('Error posting thread: ' + error.message);
        }
    }

    // Refresh access token using refresh token
    async refreshAccessToken(refreshToken) {
        try {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
                await this.client.refreshOAuth2Token(refreshToken);
            
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new Error('Failed to refresh token: ' + error.message);
        }
    }
}

module.exports = new TwitterService();