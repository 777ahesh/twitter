const express = require('express');
const { initiateAuth, handleCallback } = require('../controllers/authController');

const router = express.Router();

// Route to initiate Twitter OAuth 2.0 authentication
router.get('/twitter', initiateAuth);

// Callback route for Twitter OAuth 2.0
router.get('/twitter/callback', handleCallback);

module.exports = router;