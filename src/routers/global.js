const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send({ status: 'Server is up!' });
});

router.get('*', (req, res) => {
  res.status(404).send({ error: 'Not found' });
});

module.exports = router;
