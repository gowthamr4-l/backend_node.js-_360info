const fs = require('fs');
const path = require('path');

const silos = [
  { name: 'residentialRent', property: 'residentialRentProperty', photo: 'propertyPhoto', folder: 'rent' },
  { name: 'residentialResale', property: 'residentialResaleProperty', photo: 'residentialResalePhoto', folder: 'residential_resale' },
  { name: 'residentialPg', property: 'residentialPgProperty', photo: 'residentialPgPhoto', folder: 'residential_pg' },
  { name: 'commercialRent', property: 'commercialRentProperty', photo: 'commercialRentPhoto', folder: 'commercial_rent' },
  { name: 'commercialSale', property: 'commercialSaleProperty', photo: 'commercialSalePhoto', folder: 'commercial_sale' },
  { name: 'landPlotResale', property: 'landPlotResaleProperty', photo: 'landPlotResalePhoto', folder: 'land_plot_resale' }
];

const serviceTemplate = `const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

const sanitizeData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (['bathrooms', 'balcony'].includes(key)) {
      sanitized[key] = value ? parseInt(value, 10) : 0;
    } else if (['rentNegotiable', 'depositNegotiable', 'maintenanceExtra', 'availableAllDay', 'priceNegotiable', 'currentlyUnderLoan'].includes(key)) {
      sanitized[key] = value === 'true' || value === true;
    } else if (['pgRoomTypes', 'preferredTenants', 'pgRules', 'otherFeatures'].includes(key)) {
      sanitized[key] = Array.isArray(value) ? value : [];
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// --- PROPERTY ---
const createProperty = async (userId, data) => {
  return await prisma.__PROPERTY_MODEL__.create({
    data: { userId: parseInt(userId, 10), ...sanitizeData(data) },
    include: { photos: true }
  });
};

const getPropertyById = async (id) => {
  return await prisma.__PROPERTY_MODEL__.findUnique({
    where: { id },
    include: { photos: { orderBy: { displayOrder: 'asc' } }, user: { select: { id: true, name: true, mobile: true } } }
  });
};

const getPropertiesByUser = async (userId) => {
  return await prisma.__PROPERTY_MODEL__.findMany({
    where: { userId: parseInt(userId, 10) },
    include: { photos: { orderBy: { displayOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
};

const updateProperty = async (id, data) => {
  return await prisma.__PROPERTY_MODEL__.update({
    where: { id },
    data: sanitizeData(data),
    include: { photos: { orderBy: { displayOrder: 'asc' } } }
  });
};

const deleteProperty = async (id) => {
  return await prisma.__PROPERTY_MODEL__.delete({ where: { id } });
};

// --- PHOTOS ---
const addPhotos = async (propertyId, files) => {
  const existingPhotos = await prisma.__PHOTO_MODEL__.findMany({ where: { propertyId }, orderBy: { displayOrder: 'desc' }, take: 1 });
  let nextOrder = existingPhotos.length > 0 ? existingPhotos[0].displayOrder + 1 : 0;
  
  const totalCount = await prisma.__PHOTO_MODEL__.count({ where: { propertyId } });
  if (totalCount + files.length > 9) {
    for (const file of files) if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error(\`Cannot add \${files.length} photos. Maximum is 9.\`);
  }

  const photoRecords = [];
  for (const file of files) {
    const photo = await prisma.__PHOTO_MODEL__.create({
      data: {
        id: file.uuid,
        propertyId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: \`img/__FOLDER_NAME__/\${file.storedName}\`,
        displayOrder: nextOrder++,
      }
    });
    photoRecords.push(photo);
  }
  return photoRecords;
};

const getPhotosByProperty = async (propertyId) => {
  return await prisma.__PHOTO_MODEL__.findMany({ where: { propertyId }, orderBy: { displayOrder: 'asc' } });
};

const deletePhoto = async (photoId) => {
  const photo = await prisma.__PHOTO_MODEL__.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error('Photo not found');
  
  const filePath = path.join(__dirname, '../../', photo.url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  
  return await prisma.__PHOTO_MODEL__.delete({ where: { id: photoId } });
};

const reorderPhotos = async (propertyId, orderedIds) => {
  const updates = orderedIds.map((id, index) => prisma.__PHOTO_MODEL__.update({ where: { id }, data: { displayOrder: index } }));
  await prisma.$transaction(updates);
  return await prisma.__PHOTO_MODEL__.findMany({ where: { propertyId }, orderBy: { displayOrder: 'asc' } });
};

module.exports = {
  createProperty, getPropertyById, getPropertiesByUser, updateProperty, deleteProperty,
  addPhotos, getPhotosByProperty, deletePhoto, reorderPhotos,
};`;

const controllerTemplate = `const service = require('../services/__NAME__.service');
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
  createProperty, getPropertyById, getPropertiesByUser, updateProperty, deleteProperty,
  uploadPhotos, getPhotos, deletePhoto, reorderPhotos
};`;

const routeTemplate = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/__NAME__.controller');
const upload = require('../config/multer');

router.post('/', controller.createProperty);
router.get('/user/:userId', controller.getPropertiesByUser);
router.get('/:id', controller.getPropertyById);
router.put('/:id', controller.updateProperty);
router.delete('/:id', controller.deleteProperty);

router.post('/:propertyId/photos', upload.array('photos', 9), controller.uploadPhotos);
router.get('/:propertyId/photos', controller.getPhotos);
router.put('/:propertyId/photos/reorder', controller.reorderPhotos);
router.delete('/photos/:photoId', controller.deletePhoto);

module.exports = router;`;

silos.forEach(silo => {
  // Service
  const serviceCode = serviceTemplate
    .replace(/__PROPERTY_MODEL__/g, silo.property)
    .replace(/__PHOTO_MODEL__/g, silo.photo)
    .replace(/__FOLDER_NAME__/g, silo.folder);
  fs.writeFileSync(path.join(__dirname, 'src', 'services', silo.name + '.service.js'), serviceCode);

  // Controller
  const controllerCode = controllerTemplate
    .replace(/__NAME__/g, silo.name);
  fs.writeFileSync(path.join(__dirname, 'src', 'controllers', silo.name + '.controller.js'), controllerCode);

  // Route
  const routeCode = routeTemplate
    .replace(/__NAME__/g, silo.name);
  fs.writeFileSync(path.join(__dirname, 'src', 'routes', silo.name + '.routes.js'), routeCode);
});

console.log('All silo files generated successfully!');
