const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Dashboard Stats (Level A)
router.get('/dashboard-stats', async (req, res) => {
    try {
        const { month, year } = req.query;
        const date = new Date();
        const currentMonth = month ? parseInt(month) : date.getMonth();
        const currentYear = year ? parseInt(year) : date.getFullYear();

        // Date ranges for current month
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

        // Date ranges for last month (for comparison)
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfLastMonth = new Date(currentYear, currentMonth, 0);

        // 1. Total Purchased (Cost of Inventory Ingreso)
        const purchases = await prisma.productHistory.findMany({
            where: {
                type: 'Ingreso',
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            include: {
                product: true
            }
        });

        const totalPurchased = purchases.reduce((acc, curr) => {
            return acc + (curr.quantity * (curr.product.providerPrice || 0));
        }, 0);

        // Last Month Purchases for Comparison
        const lastMonthPurchases = await prisma.productHistory.findMany({
            where: {
                type: 'Ingreso',
                date: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth
                }
            },
            include: { product: true }
        });
        const lastTotalPurchased = lastMonthPurchases.reduce((acc, curr) => acc + (curr.quantity * (curr.product.providerPrice || 0)), 0);

        const purchasedGrowth = lastTotalPurchased === 0 ? 100 : ((totalPurchased - lastTotalPurchased) / lastTotalPurchased) * 100;


        // 2. Orders Made (Count of Ingresos)
        const ordersMade = purchases.length;
        const lastOrdersMade = lastMonthPurchases.length;
        const ordersGrowth = lastOrdersMade === 0 ? 100 : ((ordersMade - lastOrdersMade) / lastOrdersMade) * 100;


        // 3. Low Stock Items
        const lowStockCount = await prisma.product.count({
            where: {
                stock: {
                    lt: 5 // Default threshold, could be dynamic
                },
                isBundle: false // Only count physical items
            }
        });
        // Comparison logic for low stock is tricky without historical stock snapshots, 
        // using simple placeholders or checking history? simplified for now:
        const lowStockGrowth = 0; // Placeholder


        // 4. Revenue / Profit from Sales (requires Sales integration)
        // Calculating simplistic "Total Generated" based on Sales in this period
        // Determine profit: (Sale Price - Cost)
        const sales = await prisma.sale.findMany({
            where: {
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        let totalRevenue = 0;
        let totalProfit = 0;

        sales.forEach(sale => {
            totalRevenue += sale.total;
            sale.items.forEach(item => {
                const cost = item.product.providerPrice || 0;
                const profit = (item.price - cost) * item.quantity;
                totalProfit += profit;
            });
        });

        // Comparison for Revenue
        const lastMonthSales = await prisma.sale.findMany({
            where: {
                date: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth
                }
            }
        });
        const lastTotalRevenue = lastMonthSales.reduce((acc, s) => acc + s.total, 0);
        const revenueGrowth = lastTotalRevenue === 0 ? 100 : ((totalRevenue - lastTotalRevenue) / lastTotalRevenue) * 100;


        res.json({
            purchased: {
                value: totalPurchased,
                growth: purchasedGrowth
            },
            orders: {
                value: ordersMade,
                growth: ordersGrowth
            },
            lowStock: {
                value: lowStockCount,
                growth: lowStockGrowth
            },
            revenue: {
                value: totalRevenue, // Or totalProfit if user meant "Ganancias" specifically
                profit: totalProfit,
                growth: revenueGrowth
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Get Level B Analytics (Charts)
router.get('/analytics', async (req, res) => {
    try {
        const { month, year } = req.query;
        const date = new Date();
        const currentMonth = month ? parseInt(month) : date.getMonth();
        const currentYear = year ? parseInt(year) : date.getFullYear();

        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

        // 1. Top Selling Products (Bar Chart)
        const saleItems = await prisma.saleItem.findMany({
            where: {
                sale: {
                    date: { gte: startOfMonth, lte: endOfMonth },
                    status: 'Completed'
                }
            },
            include: { product: true }
        });

        const productSales = {};
        saleItems.forEach(item => {
            const name = item.product.name;
            productSales[name] = (productSales[name] || 0) + item.quantity;
        });

        const topProducts = Object.entries(productSales)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5); // Top 5 for chart

        // 2. Orders Analytics (Horizontal Chart)
        const salesInMonth = await prisma.sale.findMany({
            where: {
                date: { gte: startOfMonth, lte: endOfMonth }
            }
        });

        const orderStats = {
            Ventas: salesInMonth.filter(s => s.status === 'Completed').length,
            Ordenes: salesInMonth.length,
            Cancelados: salesInMonth.filter(s => s.status === 'Canceled').length,
            Retornados: salesInMonth.filter(s => s.status === 'Returned').length,
            Donados: salesInMonth.filter(s => s.status === 'Donated').length
        };

        // 3. Major Buyers (Semi-Circle Chart)
        const buyerStats = {};
        salesInMonth.forEach(sale => {
            const buyer = sale.customerName || 'Tienda';
            buyerStats[buyer] = (buyerStats[buyer] || 0) + 1;
        });

        const topBuyers = Object.entries(buyerStats)
            .map(([name, orders], idx) => ({
                name,
                orders,
                color: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'][idx % 5] // cycled colors
            }))
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 5);

        res.json({
            topProducts,
            orderStats,
            topBuyers
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get Level C Activities (Table)
router.get('/activities', async (req, res) => {
    try {
        const { storeId, search } = req.query;

        const whereClause = {};
        if (storeId) whereClause.storeId = parseInt(storeId);

        // If search is provided, we might need to filter by product name (requires join) or customer
        // Prisma doesn't support deep filtering easily in one go without 'some'.

        // Fetch Recent Products (Bundles or New Items)
        const recentProducts = await prisma.product.findMany({
            where: whereClause,
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { store: true }
        });

        // Fetch Recent Sales
        const recentSales = await prisma.sale.findMany({
            where: whereClause,
            take: 20,
            orderBy: { date: 'desc' },
            include: {
                store: true,
                user: true, // Fetch user info
                items: { include: { product: true } }
            }
        });

        // Flatten logic to get "Activities" rows
        let activities = [];

        // 1. Map Sales
        recentSales.forEach(sale => {
            const saleSubtotal = sale.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

            sale.items.forEach(item => {
                const now = new Date();
                const diffMs = now - new Date(sale.date);
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);

                let timeString;
                if (diffMins < 60) timeString = `${diffMins} min ago`;
                else if (diffHours < 24) timeString = `${diffHours} h ago`;
                else timeString = new Date(sale.date).toLocaleDateString();

                const itemGrossTotal = item.price * item.quantity;
                const proportion = saleSubtotal > 0 ? (itemGrossTotal / saleSubtotal) : 0;
                const itemDiscount = (sale.discount || 0) * proportion;
                const itemNetTotal = itemGrossTotal - itemDiscount;

                const providerCost = (item.product?.providerPrice || 0) * item.quantity;
                const netProfit = itemNetTotal - providerCost;

                activities.push({
                    id: `sale-${sale.id}-${item.id}`,
                    time: timeString,
                    rawDate: sale.date,
                    product: item.product.name,
                    quantity: item.quantity,
                    total: itemNetTotal, // Proportional discounted total
                    originalTotal: itemGrossTotal,
                    netProfit: netProfit, // New: Proportional profit
                    store: sale.store.name,
                    user: sale.user ? sale.user.username : 'Sistema',
                    orderType: sale.orderType || 'Venta en Tienda',
                    status: sale.paymentMethod || 'Cash',
                    saleStatus: sale.status,
                    couponCode: sale.couponCode || '',
                    type: 'sale'
                });
            });
        });

        // 2. Map Products (Creations)
        recentProducts.forEach(prod => {
            const now = new Date();
            const diffMs = now - new Date(prod.createdAt);
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);

            let timeString;
            if (diffMins < 60) timeString = `${diffMins} min ago`;
            else if (diffHours < 24) timeString = `${diffHours} h ago`;
            else timeString = new Date(prod.createdAt).toLocaleDateString();

            activities.push({
                id: `prod-${prod.id}`,
                time: timeString,
                rawDate: prod.createdAt,
                product: prod.name,
                quantity: prod.stock || 1, // Usually 0 or 1 for new items
                store: prod.store ? prod.store.name : 'General',
                orderType: prod.isBundle ? 'Nuevo Bundle' : 'Nuevo Producto',
                status: 'Creado',
                saleStatus: 'Completed',
                type: 'product'
            });
        });

        // Filter by search if provided
        if (search) {
            const lowerSearch = search.toLowerCase();
            activities = activities.filter(a =>
                a.product.toLowerCase().includes(lowerSearch) ||
                a.store.toLowerCase().includes(lowerSearch)
            );
        }

        // Sort combined list by date descending
        activities.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        res.json(activities.slice(0, 50)); // Cap at 50 items

    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// Create Bundle Product ("+")
router.post('/bundle', async (req, res) => {
    try {
        const { name, finalPrice, components, storeId } = req.body;
        // components: [{ id, quantity }]

        // Generate Code: S + Name (or S-Name)
        const code = `S-${name.toUpperCase().replace(/\s+/g, '-')}`;

        // Create the Bundle Product
        const bundle = await prisma.product.create({
            data: {
                name,
                price: parseFloat(finalPrice),
                code,
                isBundle: true,
                category: 'Producto Final', // Explicit category to distinguish from raw materials
                stock: 0,
                storeId: storeId ? parseInt(storeId) : 1,
                components: {
                    create: components.map(c => ({
                        component: { connect: { id: c.id } },
                        quantity: parseFloat(c.quantity)
                    }))
                }
            },
            include: {
                components: true
            }
        });

        res.json(bundle);

    } catch (error) {
        console.error('Error creating bundle:', error);
        res.status(500).json({ error: 'Failed to create bundle' });
    }
});

module.exports = router;
