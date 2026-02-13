const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all expenses (filtered by store if provided)
router.get('/', async (req, res) => {
    try {
        const { storeId } = req.query;
        const where = storeId ? { storeId: parseInt(storeId) } : {};

        const expenses = await prisma.expense.findMany({
            where,
            include: { store: true },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get total expense amount (filtered by store if provided)
router.get('/total', async (req, res) => {
    try {
        const { storeId } = req.query;
        const where = storeId ? { storeId: parseInt(storeId) } : {};

        const total = await prisma.expense.aggregate({
            where,
            _sum: { amount: true }
        });

        res.json({ total: total._sum.amount || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new expense
router.post('/', async (req, res) => {
    try {
        const { description, amount, category, storeId, date } = req.body;
        const expense = await prisma.expense.create({
            data: {
                description,
                amount: parseFloat(amount),
                category,
                storeId: parseInt(storeId),
                date: date ? new Date(date) : new Date()
            }
        });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        await prisma.expense.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
