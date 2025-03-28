const express = require('express');
const axios = require('axios');
/**
 * @type {express.Router}
 * Express router object
 */
const router = express.Router();

/**
 * @type {string}
 * The API key for RapidAPI
 */
// Replace with your actual RapidAPI key
const RAPIDAPI_KEY = '3bf24a3ff2mshff3259d8a663980p154c58jsn548e338e3566';
/**
 * @type {string}
 * The host for RapidAPI
 */
const RAPIDAPI_HOST = 'chatgpt-42.p.rapidapi.com';

/**
 * POST route to handle GPT-4 interaction via RapidAPI.
 * @name post/gpt
 * @route {POST} /gpt
 * @params {
 "message": {
 "type": "object",
 "description": "The message to send to GPT-4.",
 "in": "body",
 "required": true
 }
 }
 */
router.post('/gpt', async (req, res) => {
    try {
        /**
         * @type {Object}
         * Response from the gpt4 rapidAPI
         */
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