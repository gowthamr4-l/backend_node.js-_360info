const prisma = require('../config/db');
const { v4: uuidv4 } = require('uuid');

let tableEnsured = false;
const ensureTable = async () => {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SupportTicket" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ticketNumber" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "mobile" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'General Inquiry',
        "priority" TEXT NOT NULL DEFAULT 'Normal',
        "subject" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'Open',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_ticketNumber_idx" ON "SupportTicket"("ticketNumber");`);
    } catch (idxErr) {}
    tableEnsured = true;
  } catch (err) {
    console.error("Warning ensuring SupportTicket table:", err.message);
  }
};

/**
 * Generate a clean ticket code e.g. "DITS-84920"
 */
const generateTicketCode = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `DITS-${randomNum}`;
};

/**
 * Create a new support ticket
 */
const createTicket = async ({ name, email, mobile, category = 'General Inquiry', priority = 'Normal', subject, message }) => {
  await ensureTable();
  const ticketId = uuidv4();
  const ticketNumber = generateTicketCode();
  const now = new Date();

  await prisma.$executeRawUnsafe(
    `INSERT INTO "SupportTicket" ("id", "ticketNumber", "name", "email", "mobile", "category", "priority", "subject", "message", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    ticketId,
    ticketNumber,
    name,
    email || null,
    mobile,
    category,
    priority,
    subject || 'General Inquiry',
    message,
    'Open',
    now,
    now
  );

  return {
    id: ticketId,
    ticketNumber,
    name,
    email,
    mobile,
    category,
    priority,
    subject,
    message,
    status: 'Open',
    createdAt: now
  };
};

/**
 * Get tickets (with optional search)
 */
const getTickets = async (filter = {}) => {
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "SupportTicket" ORDER BY "createdAt" DESC LIMIT 100`
  );
  return rows || [];
};

module.exports = {
  createTicket,
  getTickets
};
