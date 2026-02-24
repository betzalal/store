const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { username },
            include: { stores: true }
        });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Log to memory
        await prisma.memory.create({
            data: {
                action: 'Inicio de Sesión',
                details: `Usuario ${user.username} inició sesión en el sistema.`,
                userId: user.id
            }
        });

        // In a real app, use JWT here
        res.json({ id: user.id, username: user.username, role: user.role, stores: user.stores });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Count users to check if first setup is needed
router.get('/count', async (req, res) => {
    try {
        const count = await prisma.user.count();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true, createdAt: true, stores: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user (Admin can create others)
router.post('/', async (req, res) => {
    try {
        const { username, password, role, storeId } = req.body;

        // Simple check to ensure role is valid
        const validRoles = ['admin', 'contador', 'vendedor'];
        const userRole = validRoles.includes(role) ? role : 'vendedor';

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            if (userRole === 'admin') {
                const updated = await prisma.user.update({
                    where: { username },
                    data: { password }
                });
                return res.json({ id: updated.id, username: updated.username, role: updated.role });
            }
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const userData = {
            username,
            password, // In real app, hash this!
            role: userRole
        };

        if (userRole === 'vendedor' && storeId) {
            userData.stores = {
                connect: [{ id: parseInt(storeId) }]
            };
        }

        const user = await prisma.user.create({
            data: userData,
            include: { stores: true }
        });
        res.json({ id: user.id, username: user.username, role: user.role, stores: user.stores });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role, storeId } = req.body;

        const updateData = { username };
        if (password) updateData.password = password; // Only update if provided

        if (role) {
            const validRoles = ['admin', 'contador', 'vendedor'];
            updateData.role = validRoles.includes(role) ? role : 'vendedor';
        }

        if (updateData.role === 'vendedor' && storeId) {
            updateData.stores = {
                set: [{ id: parseInt(storeId) }]
            };
        } else if (updateData.role !== 'vendedor') {
            // Disconnect all stores if changed to admin/contador (they have global access conceptually depending on implementation)
            // Or leave it alone. Let's disconnect for cleanliness.
            updateData.stores = { set: [] };
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { stores: true }
        });

        res.json({ id: user.id, username: user.username, role: user.role, stores: user.stores });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        const sales = await prisma.sale.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 20
        });

        const memories = await prisma.memory.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 20
        });

        res.json({ sales, memories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/current', async (req, res) => {
    try {
        // For now, return the first admin user found since we don't have full auth sessions yet
        const user = await prisma.user.findFirst({
            where: { role: 'admin' }
        });

        if (user) {
            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                isAdmin: user.role === 'admin'
            });
        } else {
            res.status(404).json({ error: 'No active user found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
