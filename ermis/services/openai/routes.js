require('dotenv').config();
const express = require('express');
/**
 * @type {express.Router}
 * Express router object
 */
const router = express.Router();
const OpenAI = require('openai');

/**
 * @type {OpenAI}
 * OpenAI client instance.
 */
const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

/**
 * POST route to handle chat requests to OpenAI.
 * @name post/chat
 * @route {POST} /chat
 * @params {
 "message": {
 "type": "string",
 "description": "The message to send to OpenAI",
 "in": "body",
 "required": true
 }
 }
 */
router.post('/chat', async (req, res) => {
    try {
        /**
         * @type {string}
         * User message to be sent to openai.
         */
        const { message } = req.body;
        /**
         * @type {Object}
         * Chat parameters for calling OpenAI.
         */
        const params = {
            messages: [{ role: 'user', content: message }],
            model: 'gpt-3.5-turbo',
        };
        const chatCompletion = await client.chat.completions.create(params);
        /**
         * @type {string}
         * The message returned from openai.
         */
        res.json({ message: chatCompletion.choices[0].message.content });
    } catch (error) {
        if (error.response && error.response.status === 429) {
            res.status(429).json({ error: 'Quota exceeded. Please try again later or upgrade your plan.' });
        } else {
            console.error('OpenAI API Error:', error.message);
            res.status(500).json({ error: 'Error generating response from OpenAI.', details: error.message });
        }
    }
});

/**
 * Handles GET request to /chat endpoint which is not allowed for this endpoint.
 * @name get/chat
 * @route {GET} /chat
 * @params {}
 */
// Handle GET requests (optional)
router.get('/chat', (req, res) => {
    res.status(405).json({ error: 'Please use POST requests for this endpoint.' });
});

module.exports = router;