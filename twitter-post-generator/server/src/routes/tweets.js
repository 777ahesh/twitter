const express = require('express');
const router = express.Router();
const { generateTweet, postTweet, getModels } = require('../controllers/tweetController');

// Get available models
router.get('/models', getModels);

// Generate a tweet
router.post('/generate', generateTweet);

// Post a tweet
router.post('/post', postTweet);

// Debug endpoint to test thread creation
router.post('/test-thread', async (req, res) => {
    try {
        const { text } = req.body;
        const testText = text || "This is a very long test message that should definitely be split into multiple tweets because it exceeds the 280 character limit for a single tweet and we want to test our thread creation functionality to make sure it works properly and creates the right number of tweets based on the content length and sentence structure.";
        
        const { generateLocalTweet } = require('../services/localTweetGenerator');
        const result = generateLocalTweet('artificial intelligence and machine learning');
        
        res.json({
            inputLength: testText.length,
            result: result,
            tweetCount: result.tweets.length,
            isThread: result.isThread
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to list available Gemini models
router.get('/test-gemini-models', async (req, res) => {
    try {
        const { listAvailableModels } = require('../services/geminiService');
        const models = await listAvailableModels();
        res.json({ models });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to test specific Gemini model
router.post('/test-gemini-model', async (req, res) => {
    try {
        const { modelName, topic } = req.body;
        const { testModel } = require('../services/geminiService');
        const result = await testModel(modelName || 'gemini-2.0-flash', topic || 'artificial intelligence');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to test all Gemini models
router.post('/test-all-gemini', async (req, res) => {
    try {
        const { GEMINI_MODELS, testModel } = require('../services/geminiService');
        const { topic } = req.body;
        const testTopic = topic || 'artificial intelligence';
        
        const results = {};
        
        // Test each model
        for (const modelName of Object.keys(GEMINI_MODELS)) {
            console.log(`Testing model: ${modelName}`);
            try {
                const result = await testModel(modelName, testTopic);
                results[modelName] = result;
                
                // Add delay between requests to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                results[modelName] = {
                    model: modelName,
                    success: false,
                    error: error.message
                };
            }
        }
        
        res.json({
            topic: testTopic,
            results: results,
            summary: {
                total: Object.keys(GEMINI_MODELS).length,
                successful: Object.values(results).filter(r => r.success).length,
                failed: Object.values(results).filter(r => !r.success).length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;