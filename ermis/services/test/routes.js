const express = require('express');
const router = express.Router();

router.post('/chat', (req, res) => {
    res.json({ message: 'Hello from the chat endpoint!' });
});

module.exports = router;