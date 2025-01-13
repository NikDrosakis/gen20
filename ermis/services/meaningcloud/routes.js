const express = require('express');
const router = express.Router();
const axios = require('axios');
const actiongrp = "meaningcloud"; // Define the action group
let a = [];

const API_KEY = "YOUR_MEANINGCLOUD_API_KEY" //replace with your API key;

// 1. Summarize Text
a.push({
    actiongrp: actiongrp,
    name: "summarize_text",
    description: "Summarizes a given text using the MeaningCloud API.",
    meta: "summarize",
    endpoint: "/summarize",
    method: "POST",
    params: JSON.stringify({
        text: "string",
        sentences: "number",
    })
});
router.post('/summarize', async (req, res) => {
    try {
        const { text, sentences } = req.body;
        const SUMMARIZATION_API_URL = 'https://api.meaningcloud.com/summarization-1.0';

        const response = await axios.post(`${SUMMARIZATION_API_URL}`,null, {
            params: {
                key: API_KEY,
                txt: text,
                sentences:sentences
            }
        });

        if (response.data.status.code == 0) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json({
                error: 'MeaningCloud summarization failed',
                details: response.data.status.msg,
                data: response.data
            })
        }


    } catch (error) {
        console.error('Error summarizing text:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to summarize text',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

// 2. Analyze Sentiment
a.push({
    actiongrp: actiongrp,
    name: "analyze_sentiment",
    description: "Analyzes the sentiment of a given text using the MeaningCloud API.",
    meta: "sentiment",
    method: "POST",
    endpoint: "/sentiment",
    params: JSON.stringify({
        text: "string"
    })
});
router.post('/sentiment', async (req, res) => {
    try {
        const { text } = req.body;
        const SENTIMENT_API_URL = 'https://api.meaningcloud.com/sentiment-2.1';

        const response = await axios.post(`${SENTIMENT_API_URL}`, null, {
            params: {
                key: API_KEY,
                txt: text,
                lang: "en"
            }
        });

        if (response.data.status.code == 0) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json({
                error: 'MeaningCloud sentiment analysis failed',
                details: response.data.status.msg,
                data: response.data
            });
        }


    } catch (error) {
        console.error('Error analyzing sentiment:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to analyze sentiment',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

// 3. Detect Language
a.push({
    actiongrp: actiongrp,
    name: "detect_language",
    description: "Detects the language of a given text using the MeaningCloud API.",
    meta: "text,detect",
    method: "POST",
    endpoint: "/detect",
    params: JSON.stringify({
        text: "string"
    })
});
router.post('/detect', async (req, res) => {
    try {
        const { text } = req.body;
        const LANGUAGE_DETECTION_API_URL = 'https://api.meaningcloud.com/lang-2.0';

        const response = await axios.post(`${LANGUAGE_DETECTION_API_URL}`,null, {
            params: {
                key: API_KEY,
                txt: text
            }
        });

        if (response.data.status.code == 0) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json({
                error: 'MeaningCloud language detection failed',
                details: response.data.status.msg,
                data: response.data
            });
        }


    } catch (error) {
        console.error('Error detecting language:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to detect language',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

require('../../action').add(a);
module.exports = router;