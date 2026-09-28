const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');

// Routes for /api/leads
router.route('/')
  .get(leadController.getAllLeads)
  .post(leadController.recordLead);

router.route('/property/:propertyId')
  .get(leadController.getLeadsByProperty);

router.route('/:id/status')
  .put(leadController.updateLeadStatus);

router.route('/:id')
  .delete(leadController.deleteLead);

module.exports = router;
