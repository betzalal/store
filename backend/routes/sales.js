const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const sales = await prisma.sale.findMany({
            include: {
                store: true,
                items: { include: { product: true } }
            }
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { storeId, items } = req.body;

        // items should be an array of { productId, quantity }

        // Calculate total and prepare sale items
        let total = 0;
        const saleItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) continue;

            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            saleItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });

            // Update stock
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: product.stock - item.quantity }
            });
        }

        const sale = await prisma.sale.create({
            data: {
                storeId,
                total,
                items: {
                    create: saleItemsData
                }
            },
            include: { items: true }
        });

        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
