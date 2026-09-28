const leadService = require('../services/lead.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route POST /api/leads
 * @desc Record a lead when a user views a property
 */
const recordLead = asyncHandler(async (req, res) => {
  const { userId, propertyId, propertyType, status, viewedTime } = req.body;
  if (!userId || !propertyId) {
    return res.status(400).json({
      success: false,
      message: 'userId and propertyId are required to record a lead'
    });
  }

  const lead = await leadService.recordLead({
    userId,
    propertyId,
    propertyType,
    status,
    viewedTime
  });

  res.status(201).json({
    success: true,
    data: lead
  });
});

/**
 * @route GET /api/leads/property/:propertyId
 * @desc Get all leads for a specific property
 */
const getLeadsByProperty = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const leads = await leadService.getLeadsByProperty(propertyId);
  res.status(200).json({
    success: true,
    data: leads
  });
});

/**
 * @route GET /api/leads
 * @desc Get leads with optional filtering
 */
const getAllLeads = asyncHandler(async (req, res) => {
  const { propertyId, userId } = req.query;
  let leads;
  if (propertyId) {
    leads = await leadService.getLeadsByProperty(propertyId);
  } else {
    leads = await leadService.getAllLeads({ propertyId, userId });
  }
  res.status(200).json({
    success: true,
    data: leads
  });
});

/**
 * @route PUT /api/leads/:id/status
 * @desc Update lead status
 */
const updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'status is required'
    });
  }

  const result = await leadService.updateLeadStatus(id, status);
  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route DELETE /api/leads/:id
 * @desc Delete a lead
 */
const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await leadService.deleteLead(id);
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  recordLead,
  getLeadsByProperty,
  getAllLeads,
  updateLeadStatus,
  deleteLead
};
