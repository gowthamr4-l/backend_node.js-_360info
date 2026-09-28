const prisma = require('../config/db');

const PROPERTY_MODELS = [
  { name: 'residentialRentProperty', category: 'Residential', type: 'Rent' },
  { name: 'residentialResaleProperty', category: 'Residential', type: 'Resale' },
  { name: 'residentialPgProperty', category: 'Residential', type: 'PG / Hostel' },
  { name: 'commercialRentProperty', category: 'Commercial', type: 'Rent' },
  { name: 'commercialSaleProperty', category: 'Commercial', type: 'Resale' },
  { name: 'landPlotResaleProperty', category: 'Land / Plot', type: 'Resale' },
];

/**
 * Helper to serialize BigInt mobile and user fields
 */
const serializeProperty = (p) => {
  if (!p) return null;
  const serialized = { ...p };
  if (serialized.user && serialized.user.mobile) {
    serialized.user = {
      ...serialized.user,
      mobile: serialized.user.mobile.toString(),
    };
  }
  return serialized;
};

/**
 * Get paginated properties feed for Home Page with filters and sorting
 * @param {Object} query - { page, limit, category, adType, city, search, minPrice, maxPrice, sortBy }
 */
const getPaginatedFeed = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = Math.max(1, parseInt(query.limit || 10, 10));
  const skip = (page - 1) * limit;

  const category = query.category;
  const adType = query.adType;
  const city = query.city ? query.city.trim() : null;
  const search = query.search ? query.search.trim().toLowerCase() : null;
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : null;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : null;
  const sortBy = query.sortBy || 'newest';

  // Determine which models to query based on category & adType filters
  let targetModels = PROPERTY_MODELS;

  if (category && category !== 'ALL') {
    if (category === 'PG' || category === 'PG / Hostel') {
      targetModels = targetModels.filter((m) => m.type === 'PG / Hostel');
    } else if (category === 'RENT') {
      targetModels = targetModels.filter((m) => m.category === 'Residential' && m.type === 'Rent');
    } else if (category === 'BUY') {
      targetModels = targetModels.filter((m) => m.category === 'Residential' && m.type === 'Resale');
    } else if (category === 'LAND') {
      targetModels = targetModels.filter((m) => m.category === 'Land / Plot');
    } else if (category === 'COMMERCIAL') {
      targetModels = targetModels.filter((m) => m.category === 'Commercial');
    } else {
      targetModels = targetModels.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }
  }

  if (adType) {
    targetModels = targetModels.filter((m) => m.type.toLowerCase() === adType.toLowerCase());
  }

  // Fetch active properties from target models
  const fetchPromises = targetModels.map((m) =>
    prisma[m.name]
      .findMany({
        where: {
          NOT: { isActive: false },
          ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
        },
        include: {
          photos: {
            orderBy: { displayOrder: 'asc' },
          },
          user: {
            select: { id: true, name: true, mobile: true, email: true, isRealEstateAgent: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      .catch((err) => {
        console.error(`Error querying model ${m.name}:`, err);
        return [];
      })
  );

  const results = await Promise.all(fetchPromises);
  let allProperties = [];
  results.forEach((list) => {
    allProperties = [...allProperties, ...list];
  });

  // Apply in-memory search filtering (for flexible cross-field matching: locality, city, landmark, bhk, propertyType)
  if (search) {
    allProperties = allProperties.filter((p) => {
      const q = search.toLowerCase();
      const loc = (p.locality || '').toLowerCase();
      const ct = (p.city || '').toLowerCase();
      const lnd = (p.landmark || '').toLowerCase();
      const ptype = (p.propertyType || '').toLowerCase();
      const bhk = (p.bhkType || '').toLowerCase();
      const pcat = (p.propertyCategory || '').toLowerCase();
      const pad = (p.adType || '').toLowerCase();

      return (
        loc.includes(q) ||
        ct.includes(q) ||
        lnd.includes(q) ||
        ptype.includes(q) ||
        bhk.includes(q) ||
        pcat.includes(q) ||
        pad.includes(q)
      );
    });
  }

  // Apply budget filter
  if (minPrice !== null || maxPrice !== null) {
    allProperties = allProperties.filter((p) => {
      const price = parseFloat(p.expectedPrice || p.expectedRent || 0);
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      return true;
    });
  }

  // Sort properties
  allProperties.sort((a, b) => {
    const priceA = parseFloat(a.expectedPrice || a.expectedRent || 0);
    const priceB = parseFloat(b.expectedPrice || b.expectedRent || 0);

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    // Default newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalCount = allProperties.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginatedItems = allProperties.slice(skip, skip + limit).map(serializeProperty);

  return {
    items: paginatedItems,
    pagination: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  getPaginatedFeed,
  serializeProperty,
};
