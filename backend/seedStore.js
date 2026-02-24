const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const storeCount = await prisma.store.count();
    if (storeCount === 0) {
        const store = await prisma.store.create({
            data: {
                name: 'Bodega Central',
                location: 'Sede Principal'
            }
        });
        console.log("Created default store:", store);
    } else {
        console.log("Stores already exist. Doing nothing.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
