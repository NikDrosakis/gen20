require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function listModels() {
    try {
        const models = await openai.models.list();
        console.log('Available models:', models);
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();