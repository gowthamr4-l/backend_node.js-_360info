const photoService = require('../services/photo.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Upload photos for a property (up to 9).
 * POST /api/properties/:propertyId/photos
 */
const uploadPhotos = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No photos uploaded' });
  }

  const photos = await photoService.addPhotos(req.photoModel, propertyId, req.files, req.folderName);

  res.status(201).json({
    success: true,
    message: `${photos.length} photo(s) uploaded successfully`,
    data: photos
  });
});

/**
 * Get all photos for a property.
 * GET /api/properties/:propertyId/photos
 */
const getPhotos = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const photos = await photoService.getPhotosByProperty(req.photoModel, propertyId);

  res.status(200).json({
    success: true,
    data: photos
  });
});

/**
 * Delete a single photo.
 * DELETE /api/properties/photos/:photoId
 */
const deletePhoto = asyncHandler(async (req, res) => {
  const { photoId } = req.params;

  await photoService.deletePhoto(req.photoModel, photoId);

  res.status(200).json({
    success: true,
    message: 'Photo deleted successfully'
  });
});

/**
 * Reorder photos for a property.
 * PUT /api/properties/:propertyId/photos/reorder
 */
const reorderPhotos = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { orderedIds } = req.body;

  if (!orderedIds || !Array.isArray(orderedIds)) {
    return res.status(400).json({ success: false, message: 'orderedIds array is required' });
  }

  const photos = await photoService.reorderPhotos(req.photoModel, propertyId, orderedIds);

  res.status(200).json({
    success: true,
    message: 'Photos reordered successfully',
    data: photos
  });
});

module.exports = {
  uploadPhotos,
  getPhotos,
  deletePhoto,
  reorderPhotos,
};
