const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const stores = await prisma.store.findMany();
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, location } = req.body;
        const store = await prisma.store.create({
            data: { name, location }
        });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
