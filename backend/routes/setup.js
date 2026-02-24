const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Check setup status
router.get('/status', async (req, res) => {
    try {
        const config = await prisma.systemConfig.findFirst();
        res.json({ isSetup: config ? config.isSetup : false, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update System Config (Theme, Background, etc.)
router.put('/config', async (req, res) => {
    try {
        console.log("Updating config with body:", req.body); // DEBUG
        const { themeMode, backgroundUrl, companyName, slogan, nit, categoryIcons } = req.body;
        const existingConfig = await prisma.systemConfig.findFirst();

        if (!existingConfig) {
            return res.status(404).json({ error: 'System configuration not found' });
        }

        const updatedConfig = await prisma.systemConfig.update({
            where: { id: existingConfig.id },
            data: {
                ...(themeMode && { themeMode }),
                ...(backgroundUrl !== undefined && { backgroundUrl }),
                ...(companyName && { companyName }),
                ...(slogan && { slogan }),
                ...(nit && { nit }),
                ...(nit && { nit }),
                ...(categoryIcons !== undefined && {
                    categoryIcons: typeof categoryIcons === 'object' ? JSON.stringify(categoryIcons) : categoryIcons
                })
            }
        });

        res.json({ success: true, config: updatedConfig });
    } catch (error) {
        console.error("Update config error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Perform setup
router.post('/', async (req, res) => {
    try {
        const { companyInfo, customization } = req.body;

        // 1. Setup Data no longer includes admin user creation here.
        // It relies on the standalone users logic or /login creation when empty.

        // 2. Save System Config
        // Check if config exists
        const existingConfig = await prisma.systemConfig.findFirst();

        const configData = {
            companyName: companyInfo.name,
            nit: companyInfo.nit || '0', // Add NIT handling
            logoUrl: companyInfo.logoUrl,
            slogan: companyInfo.slogan,
            themeMode: customization.themeMode,
            backgroundUrl: customization.backgroundUrl,
            isSetup: true
        };

        if (existingConfig) {
            await prisma.systemConfig.update({
                where: { id: existingConfig.id },
                data: configData
            });
        } else {
            await prisma.systemConfig.create({
                data: configData
            });
        }

        // 3. Create a default store if none exists
        const storeCount = await prisma.store.count();
        if (storeCount === 0) {
            await prisma.store.create({
                data: {
                    name: 'Bodega Central',
                    location: 'Sede Principal'
                }
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Upload Logo
router.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const logo = req.files.logo;
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', logo.name);

    // Ensure directory exists
    if (!fs.existsSync(path.dirname(uploadPath))) {
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    }

    logo.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);

        // Return relative path for frontend
        res.json({ url: `/uploads/${logo.name}` });
    });
});

// List available backgrounds
router.get('/backgrounds', (req, res) => {
    const backgroundsDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'fondos');

    fs.readdir(backgroundsDir, (err, files) => {
        if (err) {
            console.error('Error reading backgrounds directory:', err);
            return res.status(500).json({ error: 'Failed to list backgrounds' });
        }

        // Filter only image files if needed (svg, jpg, png, etc.)
        const images = files.filter(file => /\.(svg|png|jpg|jpeg|gif)$/i.test(file));

        // Map to URLs
        const backgrounds = images.map(file => ({
            name: file.replace(/\.[^/.]+$/, ""), // remove extension for name
            url: `/fondos/${encodeURIComponent(file)}`
        }));

        res.json(backgrounds);
    });
});


module.exports = router;
