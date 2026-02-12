const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const logs = await prisma.memory.findMany({
            orderBy: { timestamp: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { action, details } = req.body;
        const log = await prisma.memory.create({
            data: { action, details }
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
