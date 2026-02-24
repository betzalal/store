const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const stores = await prisma.store.findMany();
    console.log("Stores in DB:", stores);
}

main().catch(console.error).finally(() => prisma.$disconnect());
