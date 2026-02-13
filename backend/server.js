const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const fileUpload = require('express-fileupload');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const storeRoutes = require('./routes/stores');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');
const memoryRoutes = require('./routes/memory');
const setupRoutes = require('./routes/setup'); // Import setup routes
const systemRoutes = require('./routes/system');
const expenseRoutes = require('./routes/expenses');

app.use('/api/stores', storeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/setup', setupRoutes); // Use setup routes
app.use('/api/system', systemRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send('Store Management API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
