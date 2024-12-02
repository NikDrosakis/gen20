require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateCompletion() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo", // or another valid model ID
            messages: [
                { "role": "user", "content": "write a haiku about ai" }
            ]
        });
        console.log(completion);
    } catch (error) {
        console.error('Error generating completion:', error);
    }
}

generateCompletion();