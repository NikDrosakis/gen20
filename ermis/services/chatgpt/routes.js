const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const actiongrp = "chatgpt"; // Define the action group
const OPENAI_API_URL = 'https://api.openai.com/v1'; // OpenAI API base URL

let a = [];

// 1. Create a Chat Completion
a.push({
    actiongrp: actiongrp,
    name: "chatgpt_create_completion",
    description: "Creates a chat completion using the OpenAI API",
    endpoint: "/chat/completions",
    method: "POST",
    params: JSON.stringify({
        model: "string",
        messages: [{ role: "string", content: "string" }],
        // ... other options
    })
});
router.post(a[0].endpoint, async (req, res) => {
    try {
        const { model, messages, ...options } = req.body;

        const response = await axios.post(`${OPENAI_API_URL}/chat/completions`, {
            model,
            messages,
            ...options
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error creating chat completion:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to create chat completion',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

// 2. List Models
a.push({
    actiongrp: actiongrp,
    name: "chatgpt_list_models",
    description: "Lists all available models from the OpenAI API",
    endpoint: "/models",
    method: "GET",
    params: JSON.stringify({})
});
router.get(a[1].endpoint, async (req, res) => {
    try {
        const response = await axios.get(`${OPENAI_API_URL}/models`, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error listing models:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to list models',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

// 3. Retrieve a Model
a.push({
    actiongrp: actiongrp,
    name: "chatgpt_retrieve_model",
    description: "Retrieves a specific model by its ID",
    endpoint: "/models/:modelId",
    method: "GET",
    params: JSON.stringify({})
});
router.get(a[2].endpoint, async (req, res) => {
    try {
        const { modelId } = req.params;
        const response = await axios.get(`${OPENAI_API_URL}/models/${modelId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error retrieving model:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to retrieve model',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

// 4. Create an Image
a.push({
    actiongrp: actiongrp,
    name: "chatgpt_create_image",
    description: "Creates an image based on a prompt",
    endpoint: "/generate-image",
    method: "POST",
    params: JSON.stringify({
        prompt: "string",
        n: 1,
        size: "256x256"
    })
});
router.post(a[3].endpoint, async (req, res) => {
    try {
        const { prompt, n, size } = req.body;

        const response = await axios.post(`${OPENAI_API_URL}/images/generations`, {
            prompt,
            n,
            size
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error creating image:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to create image',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});
//require('../../action').add(a);
module.exports = router;