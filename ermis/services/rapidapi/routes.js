const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace with your actual RapidAPI key
const RAPIDAPI_KEY = '3bf24a3ff2mshff3259d8a663980p154c58jsn548e338e3566';
const RAPIDAPI_HOST = 'chatgpt-42.p.rapidapi.com';

router.post('/gpt', async (req, res) => {
    try {
        const response = await axios.post(
            `https://${RAPIDAPI_HOST}/conversationgpt4-2`,
            req.body,
            {
                headers: {
                    'X-Rapidapi-Key': RAPIDAPI_KEY,
                    'X-Rapidapi-Host': RAPIDAPI_HOST,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error communicating with GPT-4 API:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to send message',
            details: error.response ? error.response.data : error.message
        });
    }
});

module.exports = router;
