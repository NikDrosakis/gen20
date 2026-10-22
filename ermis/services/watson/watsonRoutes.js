// routes/watsonRoutes.js

const express = require('express');
const router = express.Router();
const { sendMessage } = require('./services/watson/watson');

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await sendMessage(message);
        res.json(response);
    } catch (error) {
        res.status(500).send('Error interacting with Watson Assistant');
    }
});

module.exports = router;