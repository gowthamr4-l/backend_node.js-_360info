const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

const { Prisma } = require('@prisma/client');
const validFields = Prisma.dmmf.datamodel.models.find(m => m.name === 'ResidentialRentProperty').fields.map(f => f.name);

const sanitizeData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (['id', 'userId', 'createdAt', 'updatedAt', 'photos', 'user'].includes(key)) continue;
    if (!validFields.includes(key)) continue;
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

const ensureValidUserId = async (userId) => {
  let uid = parseInt(userId, 10);
  if (uid && !isNaN(uid)) {
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (user) return user.id;
  }
  const firstUser = await prisma.user.findFirst();
  if (firstUser) return firstUser.id;
  const newUser = await prisma.user.create({
    data: { name: 'Property Owner', mobile: '9999999999', countryCode: '+91' }
  });
  return newUser.id;
};

// --- PROPERTY ---
const createProperty = async (userId, data) => {
  const validUserId = await ensureValidUserId(userId);
  return await prisma.residentialRentProperty.create({
    data: { userId: validUserId, ...sanitizeData(data) },
    include: { photos: true }
  });
};

const getPropertyById = async (id) => {
  return await prisma.residentialRentProperty.findUnique({
    where: { id },
    include: { photos: { orderBy: { displayOrder: 'asc' } }, user: { select: { id: true, name: true, mobile: true } } }
  });
};

const getAllProperties = async () => {
  return await prisma.residentialRentProperty.findMany({
    where: { NOT: { isActive: false } },
    include: { photos: { orderBy: { displayOrder: 'asc' } }, user: { select: { id: true, name: true, mobile: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

const getPropertiesByUser = async (userId) => {
  return await prisma.residentialRentProperty.findMany({
    where: { userId: parseInt(userId, 10) },
    include: { photos: { orderBy: { displayOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
};

const updateProperty = async (id, data) => {
  return await prisma.residentialRentProperty.update({
    where: { id },
    data: sanitizeData(data),
    include: { photos: { orderBy: { displayOrder: 'asc' } } }
  });
};

const deleteProperty = async (id) => {
  return await prisma.residentialRentProperty.delete({ where: { id } });
};

// --- PHOTOS ---
const addPhotos = async (propertyId, files) => {
  const existingPhotos = await prisma.propertyPhoto.findMany({ where: { propertyId }, orderBy: { displayOrder: 'desc' }, take: 1 });
  let nextOrder = existingPhotos.length > 0 ? existingPhotos[0].displayOrder + 1 : 0;
  
  const totalCount = await prisma.propertyPhoto.count({ where: { propertyId } });
  if (totalCount + files.length > 9) {
    for (const file of files) if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error(`Cannot add ${files.length} photos. Maximum is 9.`);
  }

  const photoRecords = [];
  for (const file of files) {
    const photo = await prisma.propertyPhoto.create({
      data: {
        id: file.uuid,
        propertyId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `img/rent/${file.storedName}`,
        displayOrder: nextOrder++,
      }
    });
    photoRecords.push(photo);
  }
  return photoRecords;
};

const getPhotosByProperty = async (propertyId) => {
  return await prisma.propertyPhoto.findMany({ where: { propertyId }, orderBy: { displayOrder: 'asc' } });
};

const deletePhoto = async (photoId) => {
  const photo = await prisma.propertyPhoto.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error('Photo not found');
  
  const filePath = path.join(__dirname, '../../', photo.url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  
  return await prisma.propertyPhoto.delete({ where: { id: photoId } });
};

const reorderPhotos = async (propertyId, orderedIds) => {
  const updates = orderedIds.map((id, index) => prisma.propertyPhoto.update({ where: { id }, data: { displayOrder: index } }));
  await prisma.$transaction(updates);
  return await prisma.propertyPhoto.findMany({ where: { propertyId }, orderBy: { displayOrder: 'asc' } });
};

module.exports = {
  createProperty, getPropertyById, getAllProperties, getPropertiesByUser, updateProperty, deleteProperty,
  addPhotos, getPhotosByProperty, deletePhoto, reorderPhotos,
};
