const express = require('express');
const router = express.Router();
const { pipeline } = require('@huggingface/transformers');

let sentimentPipeline;

const initializePipeline = async () => {
    if (!sentimentPipeline) {
        console.log('Initializing sentiment analysis pipeline...');
        sentimentPipeline = await pipeline('sentiment-analysis');
        console.log('Sentiment analysis pipeline initialized.');
    }
};

router.post('/anal', async (req, res) => {
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

        // Return the sentiment analysis result
        return res.json(result);
    } catch (err) {
        console.error('Error in /analyze-sentiment route:', err.message);
        return res.status(500).json({ error: 'Failed to analyze sentiment', details: err.message });
    }
});

module.exports = router;
