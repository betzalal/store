const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const { storeId } = req.query;
        const where = storeId ? { storeId: parseInt(storeId) } : {};

        const products = await prisma.product.findMany({
            where,
            include: { store: true }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, price, stock, storeId } = req.body;
        const product = await prisma.product.create({
            data: { name, price, stock, storeId }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
