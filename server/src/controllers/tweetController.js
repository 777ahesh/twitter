const express = require('express');
const router = express.Router();
const huggingFaceService = require('../services/huggingFaceService');
const twitterService = require('../services/twitterService');

// Generate a tweet based on user input
const generateTweet = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { topic, model, forceThread, forceSingle, imageData } = req.body;
        
        if (!topic || typeof topic !== 'string' || topic.trim() === '') {
            return res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
        }
        
        console.log('Generating tweet for topic:', topic, 'with model:', model || 'default');
        console.log('Thread preferences - forceThread:', forceThread, 'forceSingle:', forceSingle);
        console.log('Image data:', imageData);
        
        // Create options object for thread preferences and additional data
        const options = {
            forceThread: forceThread === true,
            forceSingle: forceSingle === true,
            imageData: imageData || null
        };
        
        const result = await huggingFaceService.generateTweet(topic.trim(), model, options);
        
        // Add image data to result if provided
        if (imageData) {
            result.imageData = imageData;
        }
        
        console.log('Generated result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error in generateTweet:', error);
        res.status(500).json({ error: 'Error generating tweet: ' + error.message });
    }
};

// Get available models
const getModels = async (req, res) => {
    try {
        const models = huggingFaceService.getAvailableModels();
        res.json({ models });
    } catch (error) {
        console.error('Error getting models:', error);
        res.status(500).json({ error: 'Error getting models: ' + error.message });
    }
};

// Post a tweet or thread to the X account
const postTweet = async (req, res) => {
    try {
        console.log('Post request body:', req.body);
        const { tweets, accessToken, isThread, imageData } = req.body;
        
        if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
            return res.status(400).json({ error: 'Tweets array is required and cannot be empty' });
        }
        
        if (!accessToken) {
            return res.status(401).json({ error: 'Access token required. Please authenticate first.' });
        }
        
        // Validate each tweet length
        for (let i = 0; i < tweets.length; i++) {
            if (!tweets[i] || typeof tweets[i] !== 'string' || tweets[i].trim().length === 0) {
                return res.status(400).json({ error: `Tweet ${i + 1} is empty or invalid` });
            }
            if (tweets[i].length > 280) {
                return res.status(400).json({ error: `Tweet ${i + 1} exceeds 280 characters (${tweets[i].length} characters)` });
            }
        }
        
        let responses = [];
        
        // Handle image data for posting
        const postOptions = {
            imageData: imageData || null
        };
        
        if (isThread && tweets.length > 1) {
            console.log(`Posting thread with ${tweets.length} tweets`);
            responses = await twitterService.postThread(tweets, accessToken, postOptions);
            console.log('Thread posted successfully');
        } else {
            console.log('Posting single tweet');
            const response = await twitterService.postTweet(tweets[0], accessToken, postOptions);
            responses = [response];
            console.log('Single tweet posted successfully');
        }
        
        res.json({ 
            success: true,
            responses, 
            isThread: isThread && tweets.length > 1,
            message: isThread && tweets.length > 1 ? 
                `Thread with ${tweets.length} tweets posted successfully` : 
                'Tweet posted successfully',
            imagePosted: !!imageData
        });
    } catch (error) {
        console.error('Error in postTweet:', error);
        res.status(500).json({ error: 'Error posting tweet: ' + error.message });
    }
};

module.exports = {
    generateTweet,
    postTweet,
    getModels,
};