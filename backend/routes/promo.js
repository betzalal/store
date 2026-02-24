const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all promo codes with stats
router.get('/', async (req, res) => {
    try {
        const promos = await prisma.promoCode.findMany({
            include: { store: true },
            orderBy: { createdAt: 'desc' }
        });

        // Enhance with usage stats from Sales table
        const enrichedPromos = await Promise.all(promos.map(async (promo) => {
            const usageCount = await prisma.sale.count({
                where: { couponCode: promo.code }
            });
            return {
                ...promo,
                usageCount,
                isActive: new Date() <= new Date(promo.validUntil) &&
                    (promo.maxUses === 0 || usageCount < promo.maxUses)
            };
        }));

        res.json(enrichedPromos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new promo code
router.post('/', async (req, res) => {
    try {
        const { code, name, storeId, externalStore, validUntil, maxUses, discountType, discountValue, productIds } = req.body;

        // Set validUntil to the end of the selected day (23:59:59.999 local time)
        const expirationDate = new Date(validUntil);
        expirationDate.setHours(23, 59, 59, 999);

        const newPromo = await prisma.promoCode.create({
            data: {
                code: code.trim().toUpperCase(),
                name,
                storeId: storeId ? parseInt(storeId) : null,
                externalStore: externalStore || null,
                validUntil: expirationDate,
                maxUses: parseInt(maxUses) || 0,
                discountType,
                discountValue: parseFloat(discountValue),
                productIds: productIds ? JSON.stringify(productIds) : null
            }
        });

        res.json(newPromo);
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Code already exists' });
        res.status(500).json({ error: error.message });
    }
});

// Delete promo code
router.delete('/:id', async (req, res) => {
    try {
        await prisma.promoCode.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Validate promo code at checkout
router.get('/validate', async (req, res) => {
    try {
        const { code, storeId } = req.query;
        if (!code) return res.status(400).json({ valid: false, message: 'Code required' });

        const promo = await prisma.promoCode.findUnique({
            where: { code: code.trim().toUpperCase() }
        });

        if (!promo) return res.status(404).json({ valid: false, message: 'Código no encontrado' });

        // Check expiration
        if (new Date() > new Date(promo.validUntil)) {
            return res.status(400).json({ valid: false, message: 'El cupón ha expirado' });
        }

        // Check store restriction
        if (promo.storeId && storeId && promo.storeId !== parseInt(storeId)) {
            return res.status(400).json({ valid: false, message: 'Cupón no válido para esta tienda' });
        }

        // Check max uses
        if (promo.maxUses > 0) {
            const usageCount = await prisma.sale.count({
                where: { couponCode: promo.code }
            });
            if (usageCount >= promo.maxUses) {
                return res.status(400).json({ valid: false, message: 'El cupón alcanzó su límite de usos' });
            }
        }

        res.json({
            valid: true,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            productIds: promo.productIds ? JSON.parse(promo.productIds) : null
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get sales for a specific promo code
router.get('/:code/sales', async (req, res) => {
    try {
        const { code } = req.params;
        const sales = await prisma.sale.findMany({
            where: { couponCode: code },
            orderBy: { date: 'desc' },
            include: {
                user: true,
                store: true,
                items: {
                    include: { product: true }
                }
            }
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
