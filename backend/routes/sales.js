const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create new Sale
router.post('/', async (req, res) => {
    try {
        const {
            storeId,
            items, // [{ id, quantity, price }]
            customerName,
            customerNit,
            customerWhatsapp,
            orderType,
            paymentMethod,
            discount,
            couponCode
        } = req.body;

        // Calculate total
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const finalTotal = subtotal - (discount || 0);

        // Transaction to ensure atomicity (create sale + update stock)
        const sale = await prisma.$transaction(async (tx) => {
            // 1. Create Sale Record
            const newSale = await tx.sale.create({
                data: {
                    storeId: parseInt(storeId),
                    total: finalTotal,
                    customerName: customerName || "Cliente General",
                    customerNit,
                    customerWhatsapp,
                    orderType,
                    paymentMethod,
                    discount: parseFloat(discount || 0),
                    couponCode,
                    items: {
                        create: items.map(item => ({
                            productId: item.id,
                            quantity: parseFloat(item.quantity),
                            price: parseFloat(item.price)
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Update Stock & Create History for each item
            for (const item of items) {
                // Decrease stock
                await tx.product.update({
                    where: { id: item.id },
                    data: { stock: { decrement: parseFloat(item.quantity) } }
                });

                // Add to history
                await tx.productHistory.create({
                    data: {
                        type: 'Salida',
                        quantity: parseFloat(item.quantity),
                        details: `Venta #${newSale.id} - ${orderType}`,
                        productId: item.id,
                        date: new Date()
                    }
                });
            }

            return newSale;
        });

        res.json(sale);

    } catch (error) {
        console.error("Error processing sale:", error);
        res.status(500).json({ error: "Failed to process sale" });
    }
});

// Get Sales History & Analytics
router.get('/', async (req, res) => {
    try {
        const { storeId, startDate, endDate } = req.query;

        const where = {};
        if (storeId) where.storeId = parseInt(storeId);
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        // 1. Fetch Sales List (Recent first)
        const sales = await prisma.sale.findMany({
            where,
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { date: 'desc' },
            take: 50 // Limit for now, pagination can be added later
        });

        // 2. Calculate Analytics (On filtered data or all data? Ideally filtered)
        // For accurate stats, we might need a separate aggregation query if pagination is used.
        // But for < 1000 sales, JS calculation is fine. Let's do a dedicated aggregation for "Month" stats if date not provided.

        let statsQuery = { ...where };
        if (!startDate && !endDate) {
            // Default to current month stats if no range specified
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            statsQuery.date = { gte: startOfMonth };
        }

        const allSalesForStats = await prisma.sale.findMany({
            where: statsQuery,
            include: { items: { include: { product: true } } }
        });

        const totalRevenue = allSalesForStats.reduce((sum, sale) => sum + sale.total, 0);
        const totalOrders = allSalesForStats.length;
        const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Payment Methods Grouping
        const paymentMethods = allSalesForStats.reduce((acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
            return acc;
        }, {});

        // Order Type Grouping
        const orderTypes = allSalesForStats.reduce((acc, sale) => {
            acc[sale.orderType] = (acc[sale.orderType] || 0) + 1;
            return acc;
        }, {});

        // Top Products
        const productStats = {};
        allSalesForStats.forEach(sale => {
            sale.items.forEach(item => {
                if (!productStats[item.productId]) {
                    productStats[item.productId] = {
                        name: item.product.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productStats[item.productId].quantity += item.quantity;
                productStats[item.productId].revenue += item.quantity * item.price;
            });
        });

        const topProducts = Object.values(productStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        res.json({
            sales,
            stats: {
                totalRevenue,
                totalOrders,
                averageTicket,
                paymentMethods,
                orderTypes,
                topProducts
            }
        });

    } catch (error) {
        console.error("Error fetching sales:", error);
        res.status(500).json({ error: "Failed to fetch sales" });
    }
});

module.exports = router;
