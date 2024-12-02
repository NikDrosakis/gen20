const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to nnew66 service');
});

module.exports = router;
