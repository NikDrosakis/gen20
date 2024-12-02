const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to new5 service');
});

module.exports = router;
