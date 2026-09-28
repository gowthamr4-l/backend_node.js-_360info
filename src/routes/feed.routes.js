const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');

// GET /api/feed or /api/properties/feed
router.get('/', feedController.getFeed);

module.exports = router;
