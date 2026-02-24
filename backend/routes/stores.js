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
        const { name, location, description, category, photos, staff } = req.body;
        // In real app, check req.user.role === 'admin'
        const store = await prisma.store.create({
            data: {
                name,
                location,
                description,
                category,
                photos: photos ? JSON.stringify(photos) : null,
                staff: staff ? JSON.stringify(staff) : null
            }
        });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, description, category, photos, staff } = req.body;

        const store = await prisma.store.update({
            where: { id: parseInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(location !== undefined && { location }),
                ...(description !== undefined && { description }),
                ...(category !== undefined && { category }),
                ...(photos !== undefined && { photos: JSON.stringify(photos) }),
                ...(staff !== undefined && { staff: JSON.stringify(staff) })
            }
        });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body; // Password for verification

        // Verify Admin Password
        // For simplicity, checking against the first admin user found
        const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });

        if (!adminUser) {
            return res.status(400).json({ error: 'No admin user found to verify password against.' });
        }

        if (adminUser.password !== password) {
            return res.status(401).json({ error: 'Invalid admin password' });
        }

        await prisma.store.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
