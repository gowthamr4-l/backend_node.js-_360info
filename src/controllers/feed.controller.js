const feedService = require('../services/feed.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get paginated properties for Home Page feed
 * GET /api/properties/feed or GET /api/feed
 */
const getFeed = asyncHandler(async (req, res) => {
  const result = await feedService.getPaginatedFeed(req.query);

  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

module.exports = {
  getFeed,
};
