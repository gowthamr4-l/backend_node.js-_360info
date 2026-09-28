const service = require('../services/residentialPg.service');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

const createProperty = asyncHandler(async (req, res) => {
  const { userId, ...data } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
  const property = await service.createProperty(userId, data);
  res.status(201).json({ success: true, message: 'Created successfully', data: property });
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await service.getPropertyById(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: 'Not found' });
  if (property.user && property.user.mobile) property.user.mobile = property.user.mobile.toString();
  res.status(200).json({ success: true, data: property });
});

const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await service.getAllProperties();
  const serialized = properties.map(p => {
    if (p.user && p.user.mobile) p.user.mobile = p.user.mobile.toString();
    return p;
  });
  res.status(200).json({ success: true, data: serialized });
});

const getPropertiesByUser = asyncHandler(async (req, res) => {
  const properties = await service.getPropertiesByUser(req.params.userId);
  res.status(200).json({ success: true, data: properties });
});

const updateProperty = asyncHandler(async (req, res) => {
  const existing = await service.getPropertyById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = await service.updateProperty(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Updated successfully', data: updated });
});

const deleteProperty = asyncHandler(async (req, res) => {
  const existing = await service.getPropertyById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
  if (existing.photos) {
    for (const photo of existing.photos) {
      const filePath = path.join(__dirname, '../../', photo.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
  await service.deleteProperty(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted successfully' });
});

const uploadPhotos = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No photos uploaded' });
  const photos = await service.addPhotos(req.params.propertyId, req.files);
  res.status(201).json({ success: true, data: photos });
});

const getPhotos = asyncHandler(async (req, res) => {
  const photos = await service.getPhotosByProperty(req.params.propertyId);
  res.status(200).json({ success: true, data: photos });
});

const deletePhoto = asyncHandler(async (req, res) => {
  await service.deletePhoto(req.params.photoId);
  res.status(200).json({ success: true, message: 'Photo deleted' });
});

const reorderPhotos = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;
  if (!orderedIds || !Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
  const photos = await service.reorderPhotos(req.params.propertyId, orderedIds);
  res.status(200).json({ success: true, data: photos });
});

module.exports = {
  createProperty, getPropertyById, getAllProperties, getPropertiesByUser, updateProperty, deleteProperty,
  uploadPhotos, getPhotos, deletePhoto, reorderPhotos
};
