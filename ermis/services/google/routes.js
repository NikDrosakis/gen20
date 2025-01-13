const express = require('express');
const router = express.Router();
const axios = require('axios');
const actiongrp = "tts";
let a = [];


const GOOGLE_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_TTS_API_KEY'; // Replace with your Google TTS API key

// 1. Generate Speech
a.push({
    actiongrp: actiongrp,
    name: "generate_speech",
    description: "Generates speech from text using the Google Cloud Text-to-Speech API.",
    meta: "speech, generate",
    params: JSON.stringify({
        url: "/speech",
        method: "POST",
        body: {
            text: "string",
            languageCode: "string"
        }
    })
});
router.post('/speech', async (req, res) => {
    try {
        const { text, languageCode } = req.body;

        const response = await axios.post(`${GOOGLE_TTS_URL}`, {
                input: {
                    text: text
                },
                voice: {
                    languageCode: languageCode,
                    ssmlGender: "NEUTRAL"
                },
                audioConfig: {
                    audioEncoding: "MP3"
                }

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                }
            });
        if(response.data.audioContent) {
            res.status(200).json({audio:response.data.audioContent});
        }else{
            res.status(500).json({
                error: 'Google TTS API did not return audio content',
                details: 'Unexpected response',
                data: response.data
            });
        }


    } catch (error) {
        console.error('Error generating speech:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to generate speech',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

require('../../action').add(a);
module.exports = router;