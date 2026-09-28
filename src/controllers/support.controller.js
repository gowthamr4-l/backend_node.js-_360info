const supportService = require('../services/support.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route POST /api/support
 * @desc Submit a new contact support ticket
 */
const submitTicket = asyncHandler(async (req, res) => {
  const { name, email, mobile, category, priority, subject, message } = req.body;

  if (!name || !mobile || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, Mobile Number, and Message are required'
    });
  }

  const ticket = await supportService.createTicket({
    name,
    email,
    mobile,
    category,
    priority,
    subject,
    message
  });

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been received. Our support team will get in touch shortly.',
    data: ticket
  });
});

/**
 * @route GET /api/support
 * @desc Get support tickets
 */
const getTickets = asyncHandler(async (req, res) => {
  const tickets = await supportService.getTickets();
  res.status(200).json({
    success: true,
    data: tickets
  });
});

module.exports = {
  submitTicket,
  getTickets
};
