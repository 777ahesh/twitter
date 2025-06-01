const axios = require('axios');

const DEV_TO_API_URL = 'https://dev.to/api/articles';

const fetchRandomArticles = async () => {
    try {
        const response = await axios.get(DEV_TO_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching articles from dev.to:', error);
        throw error;
    }
};

const getRandomArticle = async () => {
    const articles = await fetchRandomArticles();
    const randomIndex = Math.floor(Math.random() * articles.length);
    return articles[randomIndex];
};

module.exports = {
    fetchRandomArticles,
    getRandomArticle,
};