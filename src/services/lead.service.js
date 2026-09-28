const prisma = require('../config/db');
const { v4: uuidv4 } = require('uuid');

let tableEnsured = false;
const ensureTable = async () => {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PropertyLead" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "propertyId" TEXT NOT NULL,
        "propertyType" TEXT,
        "status" TEXT NOT NULL DEFAULT 'Interested',
        "viewedTime" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PropertyLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "PropertyLead" ADD COLUMN IF NOT EXISTS "viewedTime" TEXT;`);
    } catch (colErr) {}
    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PropertyLead_propertyId_idx" ON "PropertyLead"("propertyId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PropertyLead_userId_idx" ON "PropertyLead"("userId");`);
    } catch (idxErr) {}
    tableEnsured = true;
  } catch (err) {
    console.error("Warning ensuring PropertyLead table:", err.message);
  }
};

/**
 * Format current system time to exact local date/time string e.g. "23 Aug 2026, 09:37 PM"
 */
const getFormattedNow = (dateObj) => {
  const d = dateObj || new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');
  return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
};

/**
 * Serialize a lead object with BigInt mobile handling and exact viewed timestamp
 */
const serializeLead = (lead, index = 0) => {
  if (!lead) return null;
  const user = lead.user || {};
  const mobileStr = user.mobile ? `${user.countryCode || '+91'} ${user.mobile.toString()}` : '-';
  
  // Prefer stored viewedTime
  let formattedTime = lead.viewedTime || lead.viewedtime;
  if (!formattedTime || formattedTime === 'Recently') {
    const rawDate = lead.updatedAt || lead.updatedat || lead.createdAt || lead.createdat;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        formattedTime = getFormattedNow(d);
      }
    }
  }
  if (!formattedTime) formattedTime = getFormattedNow();

  return {
    no: index + 1,
    id: lead.id,
    userId: lead.userId || lead.userid,
    propertyId: lead.propertyId || lead.propertyid,
    propertyType: lead.propertyType || lead.propertytype || 'Property',
    name: user.name || 'Anonymous User',
    mobile: mobileStr,
    rawMobile: user.mobile ? user.mobile.toString() : '',
    email: user.email || '-',
    viewedTime: formattedTime,
    status: lead.status || 'Interested',
    createdAt: lead.createdAt || lead.createdat,
    updatedAt: lead.updatedAt || lead.updatedat,
    user: {
      id: user.id,
      name: user.name,
      mobile: user.mobile ? user.mobile.toString() : null,
      email: user.email,
      countryCode: user.countryCode
    }
  };
};

/**
 * Record a new lead or update an existing lead when a user views a property
 */
const recordLead = async ({ userId, propertyId, propertyType, status = 'Interested', viewedTime }) => {
  await ensureTable();
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId) || !propertyId) {
    throw new Error('Valid userId and propertyId are required');
  }

  // Verify that user exists in database to prevent foreign key errors
  const userExists = await prisma.user.findUnique({
    where: { id: parsedUserId }
  }).catch(() => null);

  if (!userExists) {
    console.warn(`User with id ${parsedUserId} not found. Skipping lead recording.`);
    return null;
  }

  // Check if lead already exists for this user and property
  const existing = await prisma.$queryRawUnsafe(
    `SELECT * FROM "PropertyLead" WHERE "userId" = $1 AND "propertyId" = $2 LIMIT 1`,
    parsedUserId,
    propertyId
  );

  let leadId;
  const now = new Date();
  const currentViewedTime = viewedTime || getFormattedNow(now);

  if (existing && existing.length > 0) {
    leadId = existing[0].id;
    // Update timestamp and viewedTime to current viewing time
    await prisma.$executeRawUnsafe(
      `UPDATE "PropertyLead" SET "updatedAt" = $1, "viewedTime" = $2, "propertyType" = COALESCE($3, "propertyType") WHERE "id" = $4`,
      now,
      currentViewedTime,
      propertyType || null,
      leadId
    );
  } else {
    leadId = uuidv4();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PropertyLead" ("id", "userId", "propertyId", "propertyType", "status", "viewedTime", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      leadId,
      parsedUserId,
      propertyId,
      propertyType || null,
      status || 'Interested',
      currentViewedTime,
      now,
      now
    );
  }

  // Fetch created/updated lead with user details
  const result = await prisma.$queryRawUnsafe(
    `SELECT pl.*, u.name as "userName", u.mobile as "userMobile", u.email as "userEmail", u."countryCode" as "userCountryCode"
     FROM "PropertyLead" pl
     JOIN "User" u ON pl."userId" = u.id
     WHERE pl.id = $1 LIMIT 1`,
    leadId
  );

  if (result && result.length > 0) {
    const row = result[0];
    return serializeLead({
      id: row.id,
      userId: row.userId || row.userid,
      propertyId: row.propertyId || row.propertyid,
      propertyType: row.propertyType || row.propertytype,
      status: row.status,
      viewedTime: row.viewedTime || row.viewedtime || currentViewedTime,
      createdAt: row.createdAt || row.createdat,
      updatedAt: row.updatedAt || row.updatedat,
      user: {
        id: row.userId || row.userid,
        name: row.userName || row.username,
        mobile: row.userMobile || row.usermobile,
        email: row.userEmail || row.useremail,
        countryCode: row.userCountryCode || row.usercountrycode
      }
    });
  }

  return { id: leadId, userId: parsedUserId, propertyId, propertyType, status, viewedTime: currentViewedTime };
};

/**
 * Get all leads for a specific property
 */
const getLeadsByProperty = async (propertyId) => {
  await ensureTable();
  if (!propertyId) return [];

  const rows = await prisma.$queryRawUnsafe(
    `SELECT pl.*, u.name as "userName", u.mobile as "userMobile", u.email as "userEmail", u."countryCode" as "userCountryCode"
     FROM "PropertyLead" pl
     JOIN "User" u ON pl."userId" = u.id
     WHERE pl."propertyId" = $1
     ORDER BY pl."updatedAt" DESC, pl."createdAt" DESC`,
    propertyId
  );

  // Deduplicate by userId so each user counts as 1
  const seenUsers = new Set();
  const uniqueRows = [];
  for (const row of rows || []) {
    const uid = String(row.userId || row.userid);
    if (uid && !seenUsers.has(uid)) {
      seenUsers.add(uid);
      uniqueRows.push(row);
    }
  }

  return uniqueRows.map((row, idx) => serializeLead({
    id: row.id,
    userId: row.userId || row.userid,
    propertyId: row.propertyId || row.propertyid,
    propertyType: row.propertyType || row.propertytype,
    status: row.status,
    viewedTime: row.viewedTime || row.viewedtime,
    createdAt: row.createdAt || row.createdat,
    updatedAt: row.updatedAt || row.updatedat,
    user: {
      id: row.userId || row.userid,
      name: row.userName || row.username,
      mobile: row.userMobile || row.usermobile,
      email: row.userEmail || row.useremail,
      countryCode: row.userCountryCode || row.usercountrycode
    }
  }, idx));
};

/**
 * Get all leads with optional filters
 */
const getAllLeads = async (filters = {}) => {
  await ensureTable();
  let query = `
    SELECT pl.*, u.name as "userName", u.mobile as "userMobile", u.email as "userEmail", u."countryCode" as "userCountryCode"
    FROM "PropertyLead" pl
    JOIN "User" u ON pl."userId" = u.id
  `;
  const params = [];
  if (filters.propertyId) {
    params.push(filters.propertyId);
    query += ` WHERE pl."propertyId" = $${params.length}`;
  } else if (filters.userId) {
    params.push(parseInt(filters.userId, 10));
    query += ` WHERE pl."userId" = $${params.length}`;
  }
  query += ` ORDER BY pl."updatedAt" DESC, pl."createdAt" DESC`;

  const rows = await prisma.$queryRawUnsafe(query, ...params);
  
  // Deduplicate so same user viewing same property counts as 1
  const seenCombos = new Set();
  const uniqueRows = [];
  for (const row of rows || []) {
    const key = `${row.propertyId || row.propertyid}_${row.userId || row.userid}`;
    if (!seenCombos.has(key)) {
      seenCombos.add(key);
      uniqueRows.push(row);
    }
  }

  return uniqueRows.map((row, idx) => serializeLead({
    id: row.id,
    userId: row.userId || row.userid,
    propertyId: row.propertyId || row.propertyid,
    propertyType: row.propertyType || row.propertytype,
    status: row.status,
    viewedTime: row.viewedTime || row.viewedtime,
    createdAt: row.createdAt || row.createdat,
    updatedAt: row.updatedAt || row.updatedat,
    user: {
      id: row.userId || row.userid,
      name: row.userName || row.username,
      mobile: row.userMobile || row.usermobile,
      email: row.userEmail || row.useremail,
      countryCode: row.userCountryCode || row.usercountrycode
    }
  }, idx));
};

/**
 * Update the status of a lead (Verified, Interested, Scheduled Visit)
 */
const updateLeadStatus = async (id, status) => {
  await ensureTable();
  const now = new Date();
  await prisma.$executeRawUnsafe(
    `UPDATE "PropertyLead" SET "status" = $1, "updatedAt" = $2 WHERE "id" = $3`,
    status,
    now,
    id
  );
  return { id, status, updatedAt: now };
};

/**
 * Delete a lead by ID
 */
const deleteLead = async (id) => {
  await ensureTable();
  await prisma.$executeRawUnsafe(
    `DELETE FROM "PropertyLead" WHERE "id" = $1`,
    id
  );
  return { id, deleted: true };
};

module.exports = {
  recordLead,
  getLeadsByProperty,
  getAllLeads,
  updateLeadStatus,
  deleteLead
};
