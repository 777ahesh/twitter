import axios from 'axios';

const API_URL = 'https://twitter-gmy4.onrender.com' || 'http://localhost:5000';

// Add axios interceptors for better debugging
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request.method?.toUpperCase(), request.url);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.data);
        return response;
    },
    error => {
        console.log('Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export const initiateTwitterAuth = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth/twitter`);
        return response.data;
    } catch (error) {
        console.error('Error initiating Twitter auth:', error.response?.data || error.message);
        throw error;
    }
};

export const generateTweet = async (topic, model, options = {}) => {
    try {
        console.log('API Call - Topic:', topic, 'Model:', model, 'Options:', options);
        
        // Prepare the request data
        const requestData = { 
            topic, 
            model,
            forceThread: options.forceThread,
            forceSingle: options.forceSingle
        };

        // Add image data if present
        if (options.imageData) {
            requestData.imageData = options.imageData;
        }

        const response = await axios.post(`${API_URL}/api/tweets/generate`, requestData);
        
        const data = response.data;
        console.log('Raw API response:', data);
        
        if (typeof data === 'string') {
            return {
                tweets: [data],
                isThread: false
            };
        } else if (data.tweets && Array.isArray(data.tweets)) {
            return {
                tweets: data.tweets,
                isThread: data.isThread || data.tweets.length > 1,
                model: data.model
            };
        } else if (data.tweet) {
            return {
                tweets: [data.tweet],
                isThread: false,
                model: data.model
            };
        } else {
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('Error generating tweet:', error.response?.data || error.message);
        throw error;
    }
};

export const generateTweetFromArticle = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/devto/generate`);
        const data = response.data;
        console.log('Raw article API response:', data);
        
        // Ensure consistent format
        let result = {};
        
        if (data.tweets && Array.isArray(data.tweets)) {
            result = {
                tweets: data.tweets,
                isThread: data.isThread || data.tweets.length > 1
            };
        } else if (data.tweet) {
            result = {
                tweets: [data.tweet],
                isThread: false
            };
        } else {
            throw new Error('Invalid response format from server');
        }
        
        if (data.article) {
            result.article = data.article;
        }
        
        return result;
    } catch (error) {
        console.error('Error fetching article for tweet:', error.response?.data || error.message);
        throw error;
    }
};

export const postTweet = async (tweetData, accessToken) => {
    try {
        const response = await axios.post(`${API_URL}/api/tweets/post`, { 
            ...tweetData,
            accessToken 
        });
        return response.data;
    } catch (error) {
        console.error('Error posting tweet:', error.response?.data || error.message);
        throw error;
    }
};