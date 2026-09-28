require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log("✅ Connected to the database successfully!");

        // Optional: run a real query to confirm it can read/write
        const users = await prisma.user.findMany();
        console.log("Users in DB:", users);
    } catch (error) {
        console.error("❌ Failed to connect to the database:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
