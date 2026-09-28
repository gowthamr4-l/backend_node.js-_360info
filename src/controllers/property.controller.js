const propertyService = require('../services/property.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Create a new residential rent property.
 * POST /api/properties
 */
const createProperty = asyncHandler(async (req, res) => {
  const effectiveUserId = req.user?.id || req.body.userId;
  const { userId, ...propertyData } = req.body;

  if (!effectiveUserId) {
    return res.status(400).json({ success: false, message: 'userId is required or user must be authenticated' });
  }
  if (!propertyData.propertyType) {
    return res.status(400).json({ success: false, message: 'propertyType is required' });
  }
  if (!propertyData.bhkType) {
    return res.status(400).json({ success: false, message: 'bhkType is required' });
  }

  const property = await propertyService.createProperty(req.propertyModel, effectiveUserId, propertyData);

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: property
  });
});

/**
 * Get a property by ID with photos.
 * GET /api/properties/:id
 */
const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await propertyService.getPropertyById(req.propertyModel, id);

  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  // Serialize BigInt mobile field from included user
  if (property.user && property.user.mobile) {
    property.user.mobile = property.user.mobile.toString();
  }

  res.status(200).json({
    success: true,
    data: property
  });
});

/**
 * Get all properties for a user.
 * GET /api/properties/user/:userId
 */
const getPropertiesByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const properties = await propertyService.getPropertiesByUser(req.propertyModel, userId);

  res.status(200).json({
    success: true,
    data: properties
  });
});

/**
 * Update a property by ID.
 * PUT /api/properties/:id
 */
const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if property exists
  const existing = await propertyService.getPropertyById(req.propertyModel, id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  const updated = await propertyService.updateProperty(req.propertyModel, id, req.body);

  res.status(200).json({
    success: true,
    message: 'Property updated successfully',
    data: updated
  });
});

/**
 * Delete a property by ID.
 * DELETE /api/properties/:id
 */
const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if property exists
  const existing = await propertyService.getPropertyById(req.propertyModel, id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  // Delete photo files from disk before deleting the property
  const fs = require('fs');
  const path = require('path');
  if (existing.photos && existing.photos.length > 0) {
    for (const photo of existing.photos) {
      const filePath = path.join(__dirname, '../../', photo.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  await propertyService.deleteProperty(req.propertyModel, id);

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});

module.exports = {
  createProperty,
  getPropertyById,
  getPropertiesByUser,
  updateProperty,
  deleteProperty,
};
