const express = require('express');
const router = express.Router();
const axios = require('axios');
const actiongrp = "deepl";
let a = [];

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = "YOUR_DEEPL_API_KEY"; // Replace with your DeepL API key

// 1. Translate Text
a.push({
    actiongrp: actiongrp,
    name: "translate_text",
    description: "Translates text using the DeepL API.",
    meta: "deep,translate",
    params: JSON.stringify({
        url: "/translate",
        method: "POST",
        body: {
            text: "string",
            target_lang: "string"
        }
    })
});
router.post('/translate', async (req, res) => {
    try {
        const { text, target_lang } = req.body;
        const response = await axios.post(DEEPL_API_URL, null, {
            params: {
                auth_key: DEEPL_API_KEY,
                text: text,
                target_lang: target_lang,
            }
        });

        if(response.data.translations && response.data.translations.length > 0) {
            res.status(200).json(response.data.translations[0].text);
        } else {
            res.status(500).json({
                error: 'DeepL API did not return translation',
                details: 'Unexpected response',
                data: response.data
            });
        }

    } catch (error) {
        console.error('Error translating text:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to translate text',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

require('../../action').add(a);
module.exports = router;