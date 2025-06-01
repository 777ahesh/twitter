const axios = require('axios');
const { generateLocalTweet } = require('./localTweetGenerator');
const { generateWithGemini, GEMINI_MODELS } = require('./geminiService');

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

const TWEET_MAX_LENGTH = 280;
const THREAD_MAX_LENGTH = 240;

// Generate all Gemini model entries
const generateGeminiModelEntries = () => {
    const entries = {};
    
    // Standard Gemini models
    Object.keys(GEMINI_MODELS).forEach(modelKey => {
        const model = GEMINI_MODELS[modelKey];
        entries[modelKey] = {
            url: null,
            name: model.displayName,
            description: model.description,
            type: 'gemini',
            modelName: modelKey,
            systemPrompt: false,
            promptTemplate: null
        };
    });
    
    // Specialized variants for top models
    const topModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
    
    topModels.forEach(modelKey => {
        const model = GEMINI_MODELS[modelKey];
        
        entries[`${modelKey}-technical`] = {
            url: null,
            name: `${model.displayName} (Technical)`,
            description: `${model.displayName} optimized for technical content`,
            type: 'gemini',
            modelName: modelKey,
            variant: 'technical',
            systemPrompt: false,
            promptTemplate: null
        };
        
        entries[`${modelKey}-business`] = {
            url: null,
            name: `${model.displayName} (Business)`,
            description: `${model.displayName} optimized for business content`,
            type: 'gemini',
            modelName: modelKey,
            variant: 'business',
            systemPrompt: false,
            promptTemplate: null
        };
        
        entries[`${modelKey}-creative`] = {
            url: null,
            name: `${model.displayName} (Creative)`,
            description: `${model.displayName} optimized for creative content`,
            type: 'gemini',
            modelName: modelKey,
            variant: 'creative',
            systemPrompt: false,
            promptTemplate: null
        };
    });
    
    return entries;
};

// Combined model list
const AVAILABLE_MODELS = {
    // Gemini models (dynamically generated)
    ...generateGeminiModelEntries(),
    
    // Local generators
    'local-generator': {
        url: null,
        name: 'Smart Local Generator',
        description: 'High-quality offline content generation - Always available',
        type: 'local',
        systemPrompt: false,
        promptTemplate: null
    },
    'local-creative': {
        url: null,
        name: 'Creative Local Generator',
        description: 'Creative and engaging content with varied templates',
        type: 'local',
        systemPrompt: false,
        promptTemplate: null
    },
    'local-technical': {
        url: null,
        name: 'Technical Local Generator',
        description: 'Specialized for programming and technical topics',
        type: 'local',
        systemPrompt: false,
        promptTemplate: null
    },
    'local-business': {
        url: null,
        name: 'Business Local Generator',
        description: 'Professional content for business and marketing',
        type: 'local',
        systemPrompt: false,
        promptTemplate: null
    },
    
    // Hugging Face models
    'zephyr-7b-beta': {
        url: 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
        name: 'Zephyr 7B Beta (HF)',
        description: 'Hugging Face AI model - Limited availability',
        type: 'huggingface',
        systemPrompt: true,
        promptTemplate: (topic) => `<|system|>
You are a social media expert. Write engaging content about the given topic. If the content needs more than 280 characters, create multiple tweets for a thread. Each tweet should be complete but connected to tell a full story.
<|user|>
Write engaging tweets about: ${topic}
<|assistant|>`
    }
};

const generateTweet = async (topic, selectedModel = 'gemini-2.0-flash', options = {}) => {
    try {
        console.log('Generating tweet for topic:', topic, 'using model:', selectedModel, 'with options:', options);
        
        const modelConfig = AVAILABLE_MODELS[selectedModel];
        if (!modelConfig) {
            console.log('Unknown model:', selectedModel, 'using local generator');
            return generateLocalTweetVariant(topic, 'local-generator', options);
        }

        // Handle different model types
        switch (modelConfig.type) {
            case 'gemini':
                return await handleGeminiGeneration(topic, selectedModel, modelConfig, options);
            case 'local':
                return generateLocalTweetVariant(topic, selectedModel, options);
            case 'huggingface':
                return await handleHuggingFaceGeneration(topic, selectedModel, modelConfig, options);
            default:
                return generateLocalTweetVariant(topic, 'local-generator', options);
        }
        
    } catch (error) {
        console.error('Error in generateTweet:', error.message);
        return generateLocalTweetVariant(topic, 'local-generator', options);
    }
};

const handleGeminiGeneration = async (topic, selectedModel, modelConfig, options = {}) => {
    try {
        const variant = modelConfig.variant || 'general';
        const modelName = modelConfig.modelName || selectedModel;
        
        console.log(`Calling Gemini with model: ${modelName}, variant: ${variant}, options:`, options);
        
        const generatedText = await generateWithGemini(topic, variant, modelName, options);
        
        if (generatedText && generatedText.length > 10) {
            console.log('Generated text from Gemini:', generatedText);
            
            // Process the text for tweets/threads with user preferences
            const result = processTextForTwitter(generatedText, options);
            console.log('Processed tweets:', result);
            
            // Add model info to result
            result.model = {
                id: selectedModel,
                name: modelConfig.name
            };
            
            return result;
        } else {
            throw new Error('No usable content generated from Gemini');
        }
    } catch (error) {
        console.log('Gemini generation failed:', error.message);
        
        // Try fallback Gemini models with same options
        const fallbackModels = ['gemini-1.5-flash', 'gemini-2.0-flash-lite'];
        for (const fallbackModel of fallbackModels) {
            if (fallbackModel !== modelConfig.modelName) {
                try {
                    console.log(`Trying fallback Gemini model: ${fallbackModel}`);
                    const fallbackText = await generateWithGemini(topic, 'general', fallbackModel, options);
                    if (fallbackText && fallbackText.length > 10) {
                        const result = processTextForTwitter(fallbackText, options);
                        result.model = {
                            id: `${fallbackModel}-fallback`,
                            name: `${GEMINI_MODELS[fallbackModel].displayName} (Fallback)`
                        };
                        return result;
                    }
                } catch (fallbackError) {
                    console.log(`Fallback model ${fallbackModel} also failed:`, fallbackError.message);
                    continue;
                }
            }
        }
        
        console.log('All Gemini models failed, falling back to local generator');
        return generateLocalTweetVariant(topic, 'local-generator', options);
    }
};

const handleHuggingFaceGeneration = async (topic, selectedModel, modelConfig, options = {}) => {
    // Always have a local fallback ready
    const localTweet = generateLocalTweetVariant(topic, 'local-generator', options);
    
    // Check if API key exists
    if (!HUGGING_FACE_API_KEY || HUGGING_FACE_API_KEY === 'your_actual_hugging_face_api_key') {
        console.log('No valid Hugging Face API key, using local generator');
        return localTweet;
    }
    
    try {
        const result = await tryHuggingFaceModel(topic, modelConfig, options);
        if (result && result.tweets && result.tweets.length > 0) {
            return result;
        }
    } catch (error) {
        console.log('Hugging Face model failed:', error.message);
    }
    
    // Fallback to local generator
    console.log('Falling back to local generator');
    return localTweet;
};

const tryHuggingFaceModel = async (topic, modelConfig, options = {}) => {
    const prompt = modelConfig.promptTemplate(topic);
    
    console.log('Trying Hugging Face model with prompt:', prompt);
    
    const response = await axios.post(
        modelConfig.url,
        { 
            inputs: prompt,
            parameters: {
                max_new_tokens: 300,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false,
                stop: ["<|user|>", "<|system|>", "\n\n\n"]
            }
        },
        {
            headers: {
                Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000
        }
    );
    
    console.log('Hugging Face API Response:', response.status, response.data);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        let generatedText = response.data[0]?.generated_text || '';
        
        // Clean up the response
        generatedText = cleanGeneratedText(generatedText);
        
        if (generatedText && generatedText.length > 10) {
            console.log('Raw generated text:', generatedText);
            
            // Process the text for tweets/threads with user preferences
            const result = processTextForTwitter(generatedText, options);
            console.log('Processed tweets:', result);
            
            // Add model info to result
            result.model = {
                id: 'zephyr-7b-beta',
                name: 'Zephyr 7B Beta (HF)'
            };
            
            return result;
        }
    }
    
    throw new Error('No usable content generated');
};

const generateLocalTweetVariant = (topic, variant, options = {}) => {
    const { generateLocalTweet, generateTechnicalLocalTweet, generateBusinessLocalTweet, generateCreativeLocalTweet } = require('./localTweetGenerator');
    
    let result;
    switch (variant) {
        case 'local-creative':
            result = generateCreativeLocalTweet(topic, options);
            break;
        case 'local-technical':
            result = generateTechnicalLocalTweet(topic, options);
            break;
        case 'local-business':
            result = generateBusinessLocalTweet(topic, options);
            break;
        default:
            result = generateLocalTweet(topic, options);
            break;
    }
    
    // Apply user preferences to local generation results
    if (options.forceSingle && result.isThread) {
        return processSingleTweet(result.tweets.join(' '));
    } else if (options.forceThread && !result.isThread && result.tweets[0].length > TWEET_MAX_LENGTH) {
        return {
            tweets: createTweetThread(result.tweets[0]),
            isThread: true
        };
    }
    
    return result;
};

// Enhanced processTextForTwitter with user preferences
const processTextForTwitter = (text, options = {}) => {
    console.log('Processing text for Twitter:', text);
    console.log('Text length:', text.length);
    console.log('User preferences:', options);
    
    const { forceThread, forceSingle } = options;
    
    // If user specifically wants a single tweet
    if (forceSingle) {
        return processSingleTweet(text);
    }
    
    // Check if the text already contains numbered tweets (from Gemini)
    if (text.includes('1/') || text.includes('2/')) {
        // Split by tweet numbers and clean up
        const tweetPattern = /(\d+\/\d+[^]*?)(?=\d+\/\d+|$)/g;
        const tweetMatches = text.match(tweetPattern);
        
        if (tweetMatches && tweetMatches.length > 1) {
            const tweets = tweetMatches.map(tweet => {
                // Clean up each tweet
                return tweet.trim()
                    .replace(/^\d+\/\d+\s*/, '') // Remove the numbering temporarily
                    .replace(/\n+/g, ' ') // Replace newlines with spaces
                    .trim();
            }).filter(tweet => tweet.length > 0);
            
            // If user wants single tweet but we got a thread, combine it
            if (forceSingle) {
                return processSingleTweet(tweets.join(' '));
            }
            
            // Re-add proper numbering
            const numberedTweets = tweets.map((tweet, index) => `${index + 1}/${tweets.length} ${tweet}`);
            
            console.log('Found pre-numbered tweets:', numberedTweets);
            return {
                tweets: numberedTweets,
                isThread: true
            };
        }
    }
    
    // If text fits in a single tweet and user doesn't force thread
    if (text.length <= TWEET_MAX_LENGTH && !forceThread) {
        return {
            tweets: [text],
            isThread: false
        };
    }
    
    // If user wants single tweet but text is long
    if (forceSingle) {
        return processSingleTweet(text);
    }
    
    // Split into thread (default behavior or when forceThread is true)
    const tweets = createTweetThread(text);
    return {
        tweets,
        isThread: tweets.length > 1
    };
};

// New function to process content as single tweet
const processSingleTweet = (text) => {
    console.log('Processing as single tweet, original length:', text.length);
    
    if (text.length <= TWEET_MAX_LENGTH) {
        return {
            tweets: [text],
            isThread: false
        };
    }
    
    // Truncate to fit in single tweet, preserving word boundaries
    let truncated = text.substring(0, TWEET_MAX_LENGTH - 3); // Reserve space for "..."
    
    // Try to end at a word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPunctuation = Math.max(
        truncated.lastIndexOf('.'), 
        truncated.lastIndexOf('!'), 
        truncated.lastIndexOf('?')
    );
    
    // Use the best breaking point
    const breakPoint = Math.max(lastSpace, lastPunctuation);
    if (breakPoint > TWEET_MAX_LENGTH - 50) { // Only if we don't lose too much content
        truncated = truncated.substring(0, breakPoint);
        if (!truncated.match(/[.!?]$/)) {
            truncated += '...';
        }
    } else {
        truncated += '...';
    }
    
    console.log('Truncated single tweet:', truncated, 'Length:', truncated.length);
    return {
        tweets: [truncated],
        isThread: false
    };
};

// Get available models
const getAvailableModels = () => {
    return Object.keys(AVAILABLE_MODELS).map(key => ({
        id: key,
        name: AVAILABLE_MODELS[key].name,
        description: AVAILABLE_MODELS[key].description
    }));
};

module.exports = {
    generateTweet,
    getAvailableModels,
    AVAILABLE_MODELS
};