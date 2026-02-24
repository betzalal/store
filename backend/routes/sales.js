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
            couponCode,
            userId
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
                    userId: userId ? parseInt(userId) : null,
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
                store: true,
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
            // Default to ALL time if no range specified (for historical chart)
            // If we wanted only current year:
            // const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            // statsQuery.date = { gte: startOfYear };
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

        // 3. Analytics for Chart based on groupBy
        const { groupBy } = req.query; // 'day', 'week', 'month', 'year'
        let chartData = [];
        let availableYears = [];

        if (groupBy === 'day') {
            // Compare Today vs Yesterday (Hourly)
            const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            chartData = hours.map(name => ({ name, today: 0, yesterday: 0, netToday: 0, netYesterday: 0 }));

            const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
            const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            const yesterdayEnd = new Date(todayStart);

            allSalesForStats.forEach(sale => {
                const date = new Date(sale.date);
                const hour = date.getHours();

                // Calculate Net Profit for this sale
                const cost = sale.items.reduce((sum, item) => sum + (item.product?.providerPrice || 0) * item.quantity, 0);
                const netProfit = sale.total - cost;

                if (date >= todayStart) {
                    chartData[hour].today += sale.total;
                    chartData[hour].netToday += netProfit;
                } else if (date >= yesterdayStart && date < yesterdayEnd) {
                    chartData[hour].yesterday += sale.total;
                    chartData[hour].netYesterday += netProfit;
                }
            });
            availableYears = ['Today', 'Yesterday']; // Pseudo-years for legend

        } else if (groupBy === 'week') {
            // Compare This Week vs Last Week (Daily)
            const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
            chartData = days.map(name => ({ name, thisWeek: 0, lastWeek: 0, netThisWeek: 0, netLastWeek: 0 }));

            const now = new Date();
            const dayOfWeek = now.getDay() || 7; // 1 (Mon) - 7 (Sun)
            const thisWeekStart = new Date(now);
            thisWeekStart.setDate(now.getDate() - dayOfWeek + 1);
            thisWeekStart.setHours(0, 0, 0, 0);

            const nextWeekStart = new Date(thisWeekStart);
            nextWeekStart.setDate(nextWeekStart.getDate() + 7);

            const lastWeekStart = new Date(thisWeekStart);
            lastWeekStart.setDate(lastWeekStart.getDate() - 7);

            allSalesForStats.forEach(sale => {
                const date = new Date(sale.date);
                if (date < lastWeekStart) return;

                // Adjust JS getDay (0=Sun) to 0=Mon for array index
                let dayIndex = date.getDay() - 1;
                if (dayIndex === -1) dayIndex = 6;

                // Calculate Net Profit for this sale
                const cost = sale.items.reduce((sum, item) => sum + (item.product?.providerPrice || 0) * item.quantity, 0);
                const netProfit = sale.total - cost;

                if (date >= thisWeekStart && date < nextWeekStart) {
                    chartData[dayIndex].thisWeek += sale.total;
                    chartData[dayIndex].netThisWeek += netProfit;
                } else if (date >= lastWeekStart && date < thisWeekStart) {
                    chartData[dayIndex].lastWeek += sale.total;
                    chartData[dayIndex].netLastWeek += netProfit;
                }
            });
            availableYears = ['This Week', 'Last Week'];

        } else if (groupBy === 'year') {
            // Total per Year
            const yearsMap = {};
            const netYearsMap = {};
            allSalesForStats.forEach(sale => {
                const year = new Date(sale.date).getFullYear();
                if (!yearsMap[year]) {
                    yearsMap[year] = 0;
                    netYearsMap[year] = 0;
                }

                // Calculate Net Profit for this sale
                const cost = sale.items.reduce((sum, item) => sum + (item.product?.providerPrice || 0) * item.quantity, 0);
                const netProfit = sale.total - cost;

                yearsMap[year] += sale.total;
                netYearsMap[year] += netProfit;
            });

            // Convert to array
            const years = Object.keys(yearsMap).sort();
            chartData = years.map(year => ({
                name: year,
                value: yearsMap[year],
                netValue: netYearsMap[year]
            }));
            availableYears = ['Revenue'];

        } else {
            // Default: Month view (Year comparison)
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            chartData = monthNames.map(name => ({ name }));
            const yearsSet = new Set();

            allSalesForStats.forEach(sale => {
                const date = new Date(sale.date);
                const year = date.getFullYear();
                const month = date.getMonth(); // 0-11

                yearsSet.add(year);
            });

            // Ensure we at least have current year if no data exists
            if (yearsSet.size === 0) {
                yearsSet.add(new Date().getFullYear());
            }

            availableYears = Array.from(yearsSet).sort();

            // Zero-fill and populate data
            allSalesForStats.forEach(sale => {
                const date = new Date(sale.date);
                const year = date.getFullYear();
                const month = date.getMonth(); // 0-11
                const yearKey = `y${year}`;
                const netYearKey = `netY${year}`;

                if (!chartData[month][yearKey]) {
                    chartData[month][yearKey] = 0;
                    chartData[month][netYearKey] = 0;
                }

                // Calculate Net Profit for this sale
                const cost = sale.items.reduce((sum, item) => sum + (item.product?.providerPrice || 0) * item.quantity, 0);
                const netProfit = sale.total - cost;

                chartData[month][yearKey] += sale.total;
                chartData[month][netYearKey] += netProfit;
            });

            // Ensure all months have 0 for all available years
            chartData.forEach(monthData => {
                availableYears.forEach(year => {
                    const yearKey = `y${year}`;
                    const netYearKey = `netY${year}`;
                    if (monthData[yearKey] === undefined) {
                        monthData[yearKey] = 0;
                        monthData[netYearKey] = 0;
                    }
                });
            });
        }

        res.json({
            sales,
            stats: {
                totalRevenue,
                totalOrders,
                averageTicket,
                paymentMethods,
                orderTypes,
                topProducts,
                chartData,
                availableYears
            }
        });

    } catch (error) {
        console.error("Error fetching sales:", error);
        res.status(500).json({ error: "Failed to fetch sales" });
    }
});

module.exports = router;
