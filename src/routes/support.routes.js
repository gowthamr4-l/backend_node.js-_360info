const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');

router.post('/', supportController.submitTicket);
router.get('/', supportController.getTickets);

module.exports = router;
