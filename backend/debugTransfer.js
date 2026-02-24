const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const stores = await prisma.store.findMany();
    console.log("\nSTORES:", stores);

    const products = await prisma.product.findMany();
    console.log("\nPRODUCTS:", products);

    const history = await prisma.productHistory.findMany();
    console.log("\nHISTORY:", history);
}

main().catch(console.error).finally(() => prisma.$disconnect());
