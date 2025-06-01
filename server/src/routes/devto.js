const express = require('express');
const { getRandomArticle, generateTweetFromArticle } = require('../controllers/devToController');

const router = express.Router();

// GET /api/devto/random
router.get('/random', getRandomArticle);

// GET /api/devto/generate (this should be /api/tweets/devto/generate)
router.get('/generate', generateTweetFromArticle);

module.exports = router;