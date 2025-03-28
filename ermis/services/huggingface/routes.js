const express = require('express');
/**
 * @type {express.Router}
 * Express router object.
 */
const router = express.Router();
const { pipeline } = require('@huggingface/transformers');

/**
 * @type {function}
 * Pipeline function for sentiment analysis.
 */
let sentimentPipeline;

/**
 * Initializes the sentiment analysis pipeline if it's not already initialized.
 * @async
 * @function initializePipeline
 * @returns {Promise<void>}
 */
const initializePipeline = async () => {
    if (!sentimentPipeline) {
        console.log('Initializing sentiment analysis pipeline...');
        sentimentPipeline = await pipeline('sentiment-analysis');
        console.log('Sentiment analysis pipeline initialized.');
    }
};

/**
 * POST route to handle sentiment analysis requests.
 * @name post/sentiment
 * @route {POST} /sentiment
 * @params {
 "text": {
 "type": "string",
 "description": "The text to perform sentiment analysis on.",
 "in": "body",
 "required": true
 }
 }
 */
router.post('/sentiment', async (req, res) => {
    try {
        // Initialize the pipeline if not already done
        await initializePipeline();
        /**
         * @type {string}
         *  Text to perform sentiment analysis on
         */
            // Get text from the request body
        const { text } = req.body;

        // Validate input
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Perform sentiment analysis
        const result = await sentimentPipeline(text);

        // Log the result for debugging
        console.log('Sentiment analysis result:', result);

        // Return the sentiment analysis result
        return res.json(result);
    } catch (err) {
        console.error('Error in /sentiment route:', err.message);
        return res.status(500).json({ error: 'Failed to analyze sentiment', details: err.message });
    }
});

module.exports = router;