'use strict';
const express = require('express');
//const router = express.Router();
const _ = require('lodash');
const { Client } = require('@botpress/chat');

//openai https://webhook.botpress.cloud/288ac779-ce7a-4e62-ab54-a99ecf7cc80b
//browser https://webhook.botpress.cloud/9526e607-6daf-4dad-9e5a-b92f39f99716
//https://cdn.botpress.cloud/webchat/v2/shareable.html?botId=76eec27b-d95d-4c66-aa35-96b8babbbe72
// Your Botpress Webhook ID
//const myWebhookId = 'dae518d0-b501-4b2b-92d1-895b460d25cb';

// Initialize Botpress client
//const client = new Client({
//  apiUrl: `https://chat.botpress.cloud/${myWebhookId}`,
//});
const webhookId = "dae518d0-b501-4b2b-92d1-895b460d25cb";
//const webhookId = process.env.WEBHOOK_ID;
if (!webhookId) {
    throw new Error('WEBHOOK_ID is required');
}

// Function to interact with Botpress API
const interactWithBotpress = async (userMessage) => {
    try {
        // Initialize Botpress Client
        const client = new Client({ apiUrl: `https://chat.botpress.cloud/${webhookId}` });

        // Step 1: Create User
        const userResponse = await client.createUser({});
        if (!userResponse || !userResponse.user) {
            throw new Error('Failed to create user.');
        }
        const { user, key } = userResponse;

        // Step 2: Create Conversation
        const conversationResponse = await client.createConversation({ 'x-user-key': key });
        if (!conversationResponse || !conversationResponse.conversation) {
            throw new Error('Failed to create conversation.');
        }
        const { conversation } = conversationResponse;

        // Step 3: Send Message
        const messageResponse = await client.createMessage({
            payload: { type: 'text', text: userMessage },
            "x-user-key": key,
            conversationId: conversation.id
        });
        if (!messageResponse || !messageResponse.message) {
            throw new Error('Failed to send message.');
        }

        const { message: incomingMessage } = messageResponse;

        // Step 4: Return the bot's response
        if (incomingMessage.payload.type === 'text') {
            return incomingMessage.payload.text;
        }
        // Interact with Botpress
        const botResponse = await interactWithBotpress(message);

        // Return the bot's response
        return res.json({ botResponse });

    } catch (err) {
        console.error('Error interacting with Botpress:', err.message);
        throw err;
    }

};

interactWithBotpress("what's the day today?");