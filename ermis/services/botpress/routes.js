'use strict';
require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Botpress API configuration
const BOTPRESS_URL = process.env.BOTPRESS_URL || 'http://localhost:3006'; // Update if necessary
const BOT_ID = process.env.BOT_ID || '76eec27b-d95d-4c66-aa35-96b8babbbe72'; // Replace with your Bot ID

// Handle POST requests to /chat
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Forward the message to Botpress
        const response = await axios.post(`${BOTPRESS_URL}/api/v1/bots/${BOT_ID}/webhooks/incoming`, {
            type: 'text',
            text: message,
        });

        // Extract response from Botpress
        const botResponse = response.data;

        res.json({ message: botResponse });
    } catch (error) {
        console.error('Botpress API Error:', error.message);
        res.status(500).json({ error: 'Error communicating with Botpress.', details: error.message });
    }
});

// Handle GET requests (optional)
router.get('/chat', (req, res) => {
    res.status(405).json({ error: 'Please use POST requests for this endpoint.' });
});

module.exports = router;
