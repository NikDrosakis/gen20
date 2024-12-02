const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to new3 service');
});

module.exports = router;
