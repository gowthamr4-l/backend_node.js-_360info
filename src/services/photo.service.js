const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

const addPhotos = async (photoModelName, propertyId, files, folder) => {
  const existingPhotos = await prisma[photoModelName].findMany({
    where: { propertyId },
    orderBy: { displayOrder: 'desc' },
    take: 1
  });

  let nextOrder = existingPhotos.length > 0 ? existingPhotos[0].displayOrder + 1 : 0;

  const totalCount = await prisma[photoModelName].count({
    where: { propertyId }
  });

  if (totalCount + files.length > 9) {
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    throw new Error(`Cannot add ${files.length} photos. Property already has ${totalCount} photos (max 9).`);
  }

  const photoRecords = [];
  for (const file of files) {
    const photo = await prisma[photoModelName].create({
      data: {
        id: file.uuid,
        propertyId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `img/${folder}/${file.storedName}`,
        displayOrder: nextOrder++,
      }
    });
    photoRecords.push(photo);
  }

  return photoRecords;
};

const getPhotosByProperty = async (photoModelName, propertyId) => {
  return await prisma[photoModelName].findMany({
    where: { propertyId },
    orderBy: { displayOrder: 'asc' }
  });
};

const deletePhoto = async (photoModelName, photoId) => {
  const photo = await prisma[photoModelName].findUnique({
    where: { id: photoId }
  });

  if (!photo) {
    throw new Error('Photo not found');
  }

  const filePath = path.join(__dirname, '../../', photo.url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return await prisma[photoModelName].delete({
    where: { id: photoId }
  });
};

const reorderPhotos = async (photoModelName, propertyId, orderedIds) => {
  const updates = orderedIds.map((id, index) =>
    prisma[photoModelName].update({
      where: { id },
      data: { displayOrder: index }
    })
  );

  await prisma.$transaction(updates);

  return await prisma[photoModelName].findMany({
    where: { propertyId },
    orderBy: { displayOrder: 'asc' }
  });
};

module.exports = {
  addPhotos,
  getPhotosByProperty,
  deletePhoto,
  reorderPhotos,
};
