const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get System Info (IP, etc)
router.get('/info', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Clean up IP format if it's ::ffff:127.0.0.1
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    }
    res.json({ ip });
});

// Get System Configuration
router.get('/config', async (req, res) => {
    try {
        const config = await prisma.systemConfig.findFirst();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Soft Reset / Clear Data
router.post('/reset', async (req, res) => {
    try {
        // Option 1: Delete all data except Admin and Config? 
        // Or specific tables? For now, let's just clear sales/inventory as an example of "Clear Data"
        // without wiping the setup entirely.

        await prisma.saleItem.deleteMany({});
        await prisma.sale.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.store.deleteMany({});

        res.json({ success: true, message: 'Operational data cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
