require('dotenv').config();
const express =require('express');
const router = express.Router();
const OpenAI =require('openai');
const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});
// Handle POST requests
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const params = {
            messages: [{ role: 'user', content: message }],
            model: 'gpt-3.5-turbo',
        };
        const chatCompletion = await client.chat.completions.create(params);

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


// Handle GET requests (optional)
router.get('/chat', (req, res) => {
    res.status(405).json({ error: 'Please use POST requests for this endpoint.' });
});

module.exports = router;
