const { TwitterApi } = require('twitter-api-v2');
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

    // Post single tweet using access token
    async postTweet(tweetContent, accessToken) {
        try {
            const twitterClient = new TwitterApi(accessToken);
            const response = await twitterClient.v2.tweet(tweetContent);
            return response;
        } catch (error) {
            throw new Error('Error posting tweet: ' + error.message);
        }
    }

    // Post tweet thread using access token
    async postThread(tweets, accessToken) {
        try {
            const twitterClient = new TwitterApi(accessToken);
            const responses = [];
            let previousTweetId = null;

            for (let i = 0; i < tweets.length; i++) {
                const tweetContent = tweets[i];
                const tweetOptions = {};

                // If this is not the first tweet, make it a reply to the previous one
                if (previousTweetId) {
                    tweetOptions.reply = {
                        in_reply_to_tweet_id: previousTweetId
                    };
                }

                console.log(`Posting tweet ${i + 1}/${tweets.length}:`, tweetContent);
                
                const response = await twitterClient.v2.tweet(tweetContent, tweetOptions);
                responses.push(response);
                
                // Store the tweet ID for the next iteration
                previousTweetId = response.data.id;
                
                // Add a small delay between tweets to avoid rate limiting
                if (i < tweets.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
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