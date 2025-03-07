const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Welcome to Seat-Ease API")
});

module.exports = router;
