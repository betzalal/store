const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Clean up existing data
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.productHistory.deleteMany({});
    await prisma.bundleComponent.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.user.deleteMany({}); // Wiping users as requested
    // Don't delete users or config if we want to keep them, but user said "wipe".
    // Let's keep users for convenience, but wipe stores?
    // User said "borrar de nuevo todo".
    // But we need at least one store "Bodega Central".

    // Checking if we should wipe users. Usually inconvenient. I'll keep users.
    // Converting stores.

    const existingStores = await prisma.store.findMany();
    // We need ID 1 to be Bodega Central.
    // If we delete all stores, auto-increment might not reset in SQLite unless we drop table or use raw query.
    // But for now, let's just delete contents and try to create ID 1 explicitly if possible, or just create one and assume it's valid.

    await prisma.store.deleteMany({});

    // Reset auto-increment for Stores (SQLite specific)
    try {
        await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name='Store'");
        await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name='Product'");
    } catch (e) {
        console.log("Could not reset sqlite_sequence, might not be sqlite or table empty.");
    }

    // 2. Create Bodega Central
    const centralStore = await prisma.store.create({
        data: {
            id: 1, // Force ID 1 if possible, otherwise it will be 1 due to reset
            name: 'Bodega Central',
            location: 'Casa Matriz / Nube',
        }
    });

    console.log('Created:', centralStore);
    console.log('Database seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
