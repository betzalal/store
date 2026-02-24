const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.memory.deleteMany({});
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.bundleComponent.deleteMany({});
    await prisma.productHistory.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.promoCode.deleteMany({});

    // Need to disconnect users from stores before deleting either, or Prisma handles it if cascading?
    // User <-> Store is a many-to-many relation, Prisma handles the join table automatically.
    await prisma.user.deleteMany({});
    await prisma.store.deleteMany({});
    await prisma.systemConfig.deleteMany({});

    // Reset all autoincrement sequences so IDs start from 1
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence;`);

    console.log("Database wiped successfully! System is now in factory state.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
