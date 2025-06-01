const twitterService = require('../services/twitterService');

// Store for code verifiers (in production, use a proper database)
const authStore = new Map();

const initiateAuth = async (req, res) => {
    try {
        const { url, codeVerifier, state } = twitterService.generateAuthUrl();
        
        // Store code verifier with state for later use
        authStore.set(state, codeVerifier);
        
        res.json({ authUrl: url, state });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
};

const handleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        
        if (!code || !state) {
            return res.status(400).json({ error: 'Missing code or state parameter' });
        }
        
        const codeVerifier = authStore.get(state);
        if (!codeVerifier) {
            return res.status(400).json({ error: 'Invalid state parameter' });
        }
        
        const { accessToken, refreshToken } = await twitterService.getAccessToken(code, codeVerifier);
        
        // Clean up stored code verifier
        authStore.delete(state);
        
        // In production, store tokens securely (database, encrypted cookies, etc.)
        // For demo purposes, we'll redirect to frontend with tokens
        res.redirect(`https://twitter-client-otl9.onrender.com?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed: ' + error.message });
    }
};

module.exports = {
    initiateAuth,
    handleCallback,
};