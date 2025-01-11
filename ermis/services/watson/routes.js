const express = require('express');
/**
 * @type {express.Router}
 * Express router object
 */
const router = express.Router();
const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

/**
 * @type {AssistantV1}
 * IBM Watson Assistant API instance
 */
const assistant = new AssistantV1({
    version: '2021-06-14',
    authenticator: new IamAuthenticator({
        apikey: 'YOUR_API_KEY', // Replace with your API key
    }),
    serviceUrl: 'YOUR_SERVICE_URL', // Replace with your service URL
});
/**
 * @type {string}
 *  The id of the watson assistant
 */
const assistantId = 'YOUR_ASSISTANT_ID'; // Replace with your assistant ID
/**
 * @type {string}
 * Session id for watson assistant
 */
const sessionId = 'YOUR_SESSION_ID'; // Replace with your session ID

/**
 * Sends a message to IBM Watson Assistant and returns the response.
 * @async
 * @function sendMessage
 * @param {string} text - The message text to send to the Watson Assistant.
 * @returns {Promise<Array>} A promise that resolves with an array of message objects from Watson.
 * @throws {Error} If there is an error during the Watson Assistant API call.
 */
async function sendMessage(text) {
    try {
        /**
         * @type {Object}
         * The response from the watson assistant api.
         */
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

/**
 * POST route to handle chat interactions with IBM Watson Assistant.
 * @name post/chat
 * @route {POST} /chat
 *  @params {
 "message": {
 "type": "string",
 "description": "Message to send to Watson Assistant",
 "in": "body",
 "required": true
 }
 }
 */
router.post('/chat', async (req, res) => {
    try {
        /**
         * @type {string}
         * The message sent by the user.
         */
        const { message } = req.body;
        /**
         * @type {Array}
         * The messages returned from the watson assistant api.
         */
        const messages = await sendMessage(message);
        res.json({ messages , user:message });
    } catch (error) {
        res.status(500).send('Error interacting with Watson Assistant: '+error.message);
    }
});

module.exports = router;