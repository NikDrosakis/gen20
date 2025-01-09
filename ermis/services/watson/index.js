const express = require('express');
const router = express.Router();
const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

const assistant = new AssistantV1({
    version: '2021-06-14',
    authenticator: new IamAuthenticator({
        apikey: 'YOUR_API_KEY', // Replace with your API key
    }),
    serviceUrl: 'YOUR_SERVICE_URL', // Replace with your service URL
});

const assistantId = 'YOUR_ASSISTANT_ID'; // Replace with your assistant ID
const sessionId = 'YOUR_SESSION_ID'; // Replace with your session ID

async function sendMessage(text) {
    try {
        const response = await assistant.message({
            assistantId: assistantId,
            sessionId: sessionId,
            input: {
                'message_type': 'text',
                'text': text
            }
        });

        return response.result.output.generic;

    } catch (err) {
        console.error('Error:', err);
        throw new Error('Error in sendMessage:' + err.message);
    }
}

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const messages = await sendMessage(message);
        res.json({ messages , user:message });
    } catch (error) {
        res.status(500).send('Error interacting with Watson Assistant: '+error.message);
    }
});

module.exports = router;