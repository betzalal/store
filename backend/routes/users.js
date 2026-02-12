const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // In a real app, use JWT here
        res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user (Admin can create others)
router.post('/', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Simple check to ensure role is valid
        const validRoles = ['admin', 'employee', 'staff']; // Add more as needed
        const userRole = validRoles.includes(role) ? role : 'employee';

        const user = await prisma.user.create({
            data: {
                username,
                password, // In real app, hash this!
                role: userRole
            }
        });
        res.json({ id: user.id, username: user.username, role: user.role });
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
