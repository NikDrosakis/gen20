const express = require('express');
const router = express.Router();
const { pipeline } = require('@huggingface/transformers');

let sentimentPipeline;

// Initialize the sentiment analysis pipeline
const initializePipeline = async () => {
    if (!sentimentPipeline) {
        console.log('Initializing sentiment analysis pipeline...');
        sentimentPipeline = await pipeline('sentiment-analysis');
        console.log('Sentiment analysis pipeline initialized.');
    }
};

// POST endpoint for sentiment analysis
router.post('/sentiment', async (req, res) => {
    try {
        // Initialize the pipeline if not already done
        await initializePipeline();

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
