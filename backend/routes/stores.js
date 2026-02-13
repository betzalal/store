const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        let where = {};

        if (userId) {
            where = {
                users: {
                    some: { id: parseInt(userId) }
                }
            };
        }

        const stores = await prisma.store.findMany({
            where,
            include: {
                _count: {
                    select: { products: true, sales: true }
                }
            }
        });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, location } = req.body;
        // In real app, check req.user.role === 'admin'
        const store = await prisma.store.create({
            data: { name, location }
        });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.store.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
