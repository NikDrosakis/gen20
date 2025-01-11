const express = require('express');
/**
 * @type {express.Router}
 * Express router object
 */
// Middleware to parse JSON body
app.use(express.json());
const router = express.Router();
const axios = require('axios');

/**
 * @type {string}
 * Botpress API URL
 */
const BOTPRESS_API_URL = 'https://chat.botpress.cloud/api/v1/botpress'; // Adjust this to match your Botpress server URL
/**
 * @type {string}
 * Bot ID
 */
const BOT_ID = '76eec27b-d95d-4c66-aa35-96b8babbbe72'; // Replace with your actual bot ID
/**
 * @type {string}
 * Webhook ID
 */
const webhookId = "dae518d0-b501-4b2b-92d1-895b460d25cb";
/**
 *  Route to get messages from botpress.
 * @name get/messages
 * @route {GET} /messages/:conversationId
 * @params {
 "conversationId": {
 "type": "string",
 "description": "ID of the conversation to get messages from",
 "in": "path",
 "required": true
 }
 }
 */
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        // Fetch messages from Botpress via HTTP API
        const response = await axios.get(`${BOTPRESS_API_URL}/bots/${BOT_ID}/conversations/${conversationId}/messages`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to fetch messages',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});
router.stack.push({
    keys: 'get/messages',
    path: '/messages/:conversationId',
    params: {
        "conversationId": {
            "type": "string",
            "description": "ID of the conversation to get messages from",
            "in": "path",
            "required": true
        }
    }
});

/**
 *  Route to send a message to botpress.
 *  @name post/send-message
 *  @route {POST} /send-message
 *  @params {
 "conversationId": {
 "type": "string",
 "description": "ID of the conversation to send message to",
 "in": "body",
 "required": true
 },
 "userId": {
 "type": "string",
 "description": "ID of the user sending the message",
 "in": "body",
 "required": true
 },
 "type": {
 "type": "string",
 "description": "Type of message to send",
 "in": "body",
 "required": true
 },
 "payload": {
 "type": "object",
 "description": "The message payload",
 "in": "body",
 "required": true
 }
 }
 */
// Route to send a message
router.post('/send-message', async (req, res) => {
    try {
        const { conversationId, userId, type, payload } = req.body;

        // Send a message to Botpress via HTTP API
        const response = await axios.post(`${BOTPRESS_API_URL}/bots/${BOT_ID}/conversations/${conversationId}/messages`, {
            userId,
            type,
            payload
        });

        res.status(200).json({ message: 'Message sent successfully', data: response.data });
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to send message',
            details: error.message,
            data: error.response ? error.response.data : null
        });
    }
});

router.stack.push({
    keys: 'post/send-message',
    path: '/send-message',
    params: {
        "conversationId": {
            "type": "string",
            "description": "ID of the conversation to send message to",
            "in": "body",
            "required": true
        },
        "userId": {
            "type": "string",
            "description": "ID of the user sending the message",
            "in": "body",
            "required": true
        },
        "type": {
            "type": "string",
            "description": "Type of message to send",
            "in": "body",
            "required": true
        },
        "payload": {
            "type": "object",
            "description": "The message payload",
            "in": "body",
            "required": true
        }
    }
});

module.exports = router;