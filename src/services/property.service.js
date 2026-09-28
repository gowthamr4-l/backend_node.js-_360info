const prisma = require('../config/db');

// Helper to sanitize and parse data before inserting to Prisma
const sanitizeData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    
    // Parse known integer fields
    if (['bathrooms', 'balcony'].includes(key)) {
      sanitized[key] = value ? parseInt(value, 10) : 0;
    } 
    // Parse known boolean fields
    else if (['rentNegotiable', 'depositNegotiable', 'maintenanceExtra', 'availableAllDay', 'priceNegotiable', 'currentlyUnderLoan'].includes(key)) {
      sanitized[key] = value === 'true' || value === true;
    }
    // Handle array fields
    else if (['pgRoomTypes', 'preferredTenants', 'pgRules', 'otherFeatures'].includes(key)) {
      sanitized[key] = Array.isArray(value) ? value : [];
    }
    else {
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

const createProperty = async (modelName, userId, data) => {
  const validUserId = await ensureValidUserId(userId);
  const sanitizedData = sanitizeData(data);
  return await prisma[modelName].create({
    data: {
      userId: validUserId,
      ...sanitizedData
    },
    include: {
      photos: true,
    }
  });
};

const getPropertyById = async (modelName, id) => {
  return await prisma[modelName].findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { displayOrder: 'asc' }
      },
      user: {
        select: { id: true, name: true, mobile: true }
      }
    }
  });
};

const getPropertiesByUser = async (modelName, userId) => {
  return await prisma[modelName].findMany({
    where: { userId: parseInt(userId, 10) },
    include: {
      photos: {
        orderBy: { displayOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateProperty = async (modelName, id, data) => {
  const sanitizedData = sanitizeData(data);
  return await prisma[modelName].update({
    where: { id },
    data: sanitizedData,
    include: {
      photos: {
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
};

const deleteProperty = async (modelName, id) => {
  return await prisma[modelName].delete({
    where: { id }
  });
};

module.exports = {
  createProperty,
  getPropertyById,
  getPropertiesByUser,
  updateProperty,
  deleteProperty,
};
