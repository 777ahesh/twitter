const devToService = require('../services/devToService');
const huggingFaceService = require('../services/huggingFaceService');

const getRandomArticle = async (req, res) => {
    try {
        const article = await devToService.getRandomArticle();
        res.status(200).json(article);
    } catch (error) {
        console.error('Error in getRandomArticle:', error);
        res.status(500).json({ message: 'Error fetching article', error: error.message });
    }
};

const generateTweetFromArticle = async (req, res) => {
    try {
        const article = await devToService.getRandomArticle();
        const prompt = `${article.title} - ${article.description || article.title}`;
        const tweet = await huggingFaceService.generateTweet(prompt);
        res.json({ tweet, article });
    } catch (error) {
        console.error('Error in generateTweetFromArticle:', error);
        res.status(500).json({ error: 'Error generating tweet from article: ' + error.message });
    }
};

module.exports = {
    getRandomArticle,
    generateTweetFromArticle,
};